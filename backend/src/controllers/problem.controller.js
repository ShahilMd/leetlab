import { db } from "../libs/db.js";

import {  getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
 // here we check if all fields are present or not
    if(!title || !description || !difficulty || !tags || !examples || !constraints || !testcases || !codeSnippets || !referenceSolutions){
      return res.status(400).json({
        error:"All fields are required"
      })
    }
    // we store title in a new veriable so that we can use it to check if problem already exists or not
  const newTitle = title.toLowerCase().replace(/\s+/g, "");

  const problem = await db.problem.findMany();
  
  if(problem.find((p)=>p.title.toLowerCase().replace(/\s+/g, "") === newTitle)){
    return res.status(400).json({
      error:"Problem already exists"
    })
  }
    
    for(const[language,solutionCode] of Object.entries(referenceSolutions)){

      const languageId = getJudge0LanguageId(language);

      if(!languageId){
        return res.status(400).json({
          error:`We don't support ${language} yet`
        })
      }
     
      const submissions = testcases.map(({input,output})=>({
        source_code:solutionCode,
        language_id:languageId,
        stdin:input,
        expected_output:output
      }));


      const submissionResults = await submitBatch(submissions);
   

      const tokens = submissionResults.map((r)=>r.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase ${i + 1} failed for language ${language}`,
          });
        }
      }
    }

      const newProblem = await db.problem.create({
        data:{
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId:req.user.id
        }
      });

      return res.status(201).json({
        status:true,
        message:"Problem created successfully",
        problem:newProblem
      })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success:false,
      message:"something went wrong",
      error:error.message
    })
    
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();
    if(!problems){
      return res.status(404).json({
        status:false,
        message:"No problems found"
      })
    }
    return res.status(200).json({
      status:true,
      message:"All problems fetched Successfully",
      problems
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"something went wrong",
      error:error.message
    })
  }
};

export const getProblemById = async (req, res) => {
  const {id} = req.params;

  if(!id){
    return res.status(404).json({
      status:false,
      message:"No Problem Id found"
    })
  }
  try {
    const problem = await db.problem.findUnique({
      where:{id},
    })

    if(!problem){
      return res.status(404).json({
        status:false,
        message:"No Problem found"
      })
    }else{
      return res.status(200).json({
        status:true,
        message:"Problem fetched Successfully",
        problem
      })
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Error in fetching Problem by Id",
      error:error.message
    })
  }
}
  
export const updateProblem = async (req, res) => {
const {id} = req.params;
const {
  title,
  description,
  difficulty,
  tags,
  examples,
  constraints,
  testcases,
  codeSnippets,
  referenceSolutions,
} = req.body;

if(!id){
  return res.status(404).json({
    status:false,
    message:"No Problem Id found"
  })
}

try {
  const problem = await db.problem.findUnique({
    where:{id},
  })

  if(!problem){
    return res.status(404).json({
      status:false,
      message:"No Problem found to update"
    })
  }

  const newTitle = title.toLowerCase().replace(/\s+/g, "");

  const problems = await db.problem.findMany();

  if(problems.find((p)=>p.title.toLowerCase().replace(/\s+/g, "") === newTitle)){
    return res.status(400).json({
      error:"Problem With this title already exists"
    })
  }
if(referenceSolutions){
  for(const[language,solutionCode] of Object.entries(referenceSolutions)){
    const languageId = getJudge0LanguageId(language);
    if(!languageId){
      return res.status(400).json({
        error:`We don't support ${language} yet`
      })
    }

    const submissions =await testcases.map(({input,output})=>({
      source_code:solutionCode,
      language_id:languageId,
      stdin:input,
      expected_output:output
    }))

    const submissionResults = await submitBatch(submissions);
   
    const tokens = submissionResults.map((r)=>r.token);

    const results = await pollBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status.id < 3) {
        return res.status(400).json({
          error: `Testcase ${i + 1} failed for language ${language}`,
        });
      }
    }
  } 
}else{
  return res.status(400).json({
    error:"Reference solutions are required"
  })
}
  const updatedProblem = await db.problem.update({
    where:{id},
    data:{
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases,
      codeSnippets,
      referenceSolutions,
      userId:req.user.id
    }
  })

  return res.status(200).json({
    status:true,
    message:"Problem updated Successfully",
    problem:updatedProblem
  })
}catch (error) {
  console.log(error)
  return res.status(500).json({
    success:false,
    message:"Error while updating the problem ",
    error:error.message
  })
}
}

export const deleteProblem = async (req, res) => {
  const {id} = req.params

  if(!id){
    return res.status(404).json({
      status:false,
      message:"No Problem ID found"
    })
  }

  try {
    const problem = await db.problem.findUnique({
        where:{id},
    })

    if(!problem){
      return res.status(404).json({
        status:false,
        message:"No Problem Found With This Id"
      })
    }

    await db.problem.delete({
      where:{id}
    })  

    return res.status(200).json({
      status:true,
      message:"Problem Deleted Successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Error while deleting the problem ",
      error:error.message
    } )
  }
};

export const getAllProblemsSolvedByUser = async (req, res) => {};