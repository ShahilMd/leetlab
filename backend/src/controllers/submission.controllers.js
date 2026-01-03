import { db } from "../libs/db.js"

export const getAllSubmissions =async (req,res) => {
  try {
    const userId = req.user.id;

    const submission = await db.submission.findMany({
      where:{
        userId:userId
      }
    })

    return res.status(200).json({
      sucess:true,
      message:"submission Fetched Sucessfully",
      submission
    })
  } catch (error) {
    return res.status(500).json({
      sucess:false,
      message:"something went wrong",
      error:error.message
    })
  }
}

export const getSubmissionForProblem = async (req,res) => {
  try {
    
    const userId = req.user.id

    const problemId = req.params.problemId

    const submission = await db.submission.findMany({
      where:{
        userId:userId,
        problemId:problemId
      }
    })

    return res.status(200).json({
      sucess:true,
      message:"submission Fetched Sucessfully",
      submission
    })

  } catch (error) {
     return res.status(500).json({
      sucess:false,
      message:"something went wrong",
      error:error.message
    })
  }
}

export const getAllTheSubmissionsForProblem = async (req,res) => {
  try {
    const problemId = req.params.problemId

    const submission = await db.submission.count({
      where:{
        problemId:problemId
      }
    })
    
    return res.status(200).json({
      sucess:true,
      message:"submission Fetched Sucessfully",
      count:submission
    })

  } catch (error) {
     return res.status(500).json({
      sucess:false,
      message:"something went wrong",
      error:error.message
    })
  }
}