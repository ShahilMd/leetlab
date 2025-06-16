import { db } from "../libs/db.js";
import { getLanguage, pollBatchResults, submitBatch } from "../libs/judge0.js";


export const runCode = async (req, res) => {

  try {
    const {
      source_code ,
      language_id ,
      stdin ,
      expected_outputs ,
      problemId
    } = req.body ; 

    const userId = req.user.id ; 

    // validate test cases is in arry form or not 
    if(!Array.isArray(stdin)||stdin.length===0||!Array.isArray(expected_outputs)||expected_outputs.length!==stdin.length){
      return res.status(400).json({
        error:"Invalid or missing testCases"
      });
    };
    //step 2 prepare each test caase for batch submission 

    const submissions = stdin.map((input)=>({
      source_code,
      language_id,
      stdin:input,
    }));

    //step 3 send this batch of submission to judge 0 

    const submitResponse = await submitBatch(submissions)
    const tokens = submitResponse.map((r)=>r.token)
// step 4 poll judge 0 for all test cases 
    const results =await pollBatchResults(tokens)

    let allPassed = true;
    
    const detaildResult = results.map((r,i)=>{
      const stdout = r.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout == expected_output;

      if(!passed){
        !allPassed
      }

      return {
        testCase:i+1,
        passed,
        stdout,
        expected:expected_output,
        stderr:r.stderr|| null,
        compileOutput:r.compile_output || null,
        status:r.status.description,
        memory:r.memory ? `${r.memory} KB`: undefined,
        time:r.time ? `${r.time} s`: undefined
      }
    })
    // store submission summary to database 
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode:source_code,
        language:getLanguage(language_id),
        stdin: stdin.join("\n"),
        stdout:JSON.stringify(detaildResult.map((r)=>r.stdout)),
        stderr:detaildResult.some((r)=>r.stderr)?JSON.stringify(detaildResult.map((r)=>r.stderr)):null,
        compileOutput:detaildResult.some((r)=>r.compile_output)?JSON.stringify(detaildResult.map((r)=>r.compile_output)):null,
        status:allPassed ? "Accepted":"Wrong Number",
        memory: detaildResult.some((r)=> r.memory) ? JSON.stringify(detaildResult.map((r)=>r.memory)) : null,
        time:detaildResult.some((r)=> r.time) ? JSON.stringify(detaildResult.map((r)=>r.time)) : null,
      },
    })

    // if allPassed is true mark problem as solved for the current user 

    if(allPassed){
      await db.problemSolved.upsert({
        where:{
          userId_problemId:{
            userId,
            problemId
          }
        },
        update:{},
        create:{
          userId,
          problemId
        }
      })
    }

    // save indivisual testCase

    const testCaseResult =detaildResult.map((r)=>({
      submissionId:submission.id,
      testCase:r.testCase,
      passed:r.passed,
      stdout:r.stdout,
      stderr:r.stderr,
      compileOutput:r.compileOutput,
      status:r.status,
      memory:r.memory,
      time:r.time,
      expected:r.expected
    }))
    await db.TestCaseResult.createMany({
      data:testCaseResult
    })

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
    });
    } catch (error) {
      console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error.message,
    })
  }
};

export const submitCode = async (req, res) => {

};