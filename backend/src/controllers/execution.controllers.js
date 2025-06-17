import { db } from "../libs/db.js";
import { getLanguage, pollBatchResults, submitBatch } from "../libs/judge0.js";



export const runCode = async (req, res) => {
  try {
    const {
      source_code,
      language_id,
      stdin,
      expected_outputs
    } = req.body;

    // Validate test cases
    if (!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
      return res.status(400).json({
        error: "Invalid or missing testCases"
      });
    }

    // Prepare each test case for batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // Send batch of submissions to Judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((r) => r.token);

    // Poll Judge0 for all test cases
    const results = await pollBatchResults(tokens);

    let allPassed = true;

    const detailedResult = results.map((r, i) => {
      const stdout = r.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) {
        allPassed = false;
      }

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: r.stderr || null,
        compileOutput: r.compile_output || null,
        status: r.status.description,
        memory: r.memory ? `${r.memory} KB` : undefined,
        time: r.time ? `${r.time} s` : undefined
      };
    });

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      allPassed,
      results: detailedResult
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while running code",
      error: error.message,
    });
  }
};

// Route 2: Submit Code (Save to database after running)
export const submitCode = async (req, res) => {
  try {
    const {
      source_code,
      language_id,
      stdin,
      expected_outputs,
      problemId
    } = req.body;

    const userId = req.user.id;

    // Validate test cases
    if (!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length) {
      return res.status(400).json({
        error: "Invalid or missing testCases"
      });
    }

    // Prepare each test case for batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    // Send batch of submissions to Judge0
    const submitResponse = await submitBatch(submissions);
    const tokens = submitResponse.map((r) => r.token);

    // Poll Judge0 for all test cases
    const results = await pollBatchResults(tokens);

    let allPassed = true;

    const detailedResult = results.map((r, i) => {
      const stdout = r.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) {
        allPassed = false;
      }

      return {
        testCase: i + 1,
        passed,
        stdout,
        expected: expected_output,
        stderr: r.stderr || null,
        compileOutput: r.compile_output || null,
        status: r.status.description,
        memory: r.memory ? `${r.memory} KB` : undefined,
        time: r.time ? `${r.time} s` : undefined
      };
    });

    // Store submission summary to database
    const submission = await db.submission.create({
      data:{
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguage(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResult.map((r) => r.stdout)),
        stderr: detailedResult.some((r) => r.stderr) ? JSON.stringify(detailedResult.map((r) => r.stderr)) : null,
        compileOutput: detailedResult.some((r) => r.compileOutput) ? JSON.stringify(detailedResult.map((r) => r.compileOutput)) : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResult.some((r) => r.memory) ? JSON.stringify(detailedResult.map((r) => r.memory)) : null,
        time: detailedResult.some((r) => r.time) ? JSON.stringify(detailedResult.map((r) => r.time)) : null,
      },
    });

    // If allPassed is true, mark problem as solved for the current user
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId
          }
        },
        update: {},
        create: {
          userId,
          problemId
        }
      });
    }

    // Save individual test case results
    const testCaseResults = detailedResult.map((r) => ({
      submissionId: submission.id,
      testCase: r.testCase,
      passed: r.passed,
      stdout: r.stdout,
      stderr: r.stderr,
      compileOutput: r.compileOutput,
      status: r.status,
      memory: r.memory,
      time: r.time,
      expected: r.expected
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults
    });

    // Fetch submission with test cases
    const submissionWithTestCases = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Code submitted successfully",
      submission: submissionWithTestCases,
      allPassed
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting code",
      error: error.message,
    });
  }
};
