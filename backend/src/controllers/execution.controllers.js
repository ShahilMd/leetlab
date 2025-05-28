import { db } from "../libs/db.js";
import { pollBatchResults, submitBatch } from "../libs/judge0.js";

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
    
    console.log(`results____-----------`)
    console.log(results)

    res.status(200).json({
      status: true,
      message: "Code submitted successfully",
    })
    
    } catch (error) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
      error: error.message,
    })
  }
};

export const submitCode = async (req, res) => {};