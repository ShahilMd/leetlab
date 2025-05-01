import { db } from "../libs/db.js";

export const isVerified =async (req,res,next)=>{
  const {email} = req.body
  if(!email){
    return res.status(400).json({
      success:false,
      error:{
        code:"EMAIL_NOT_FOUND",
        message:"Email not found"
      }
    });
  }

  const user = await db.user.findUnique({
    where:{email}
  });

  if(!user){
    return res.status(400).json({
      success:false,
      error:{
        code:"EMAIL_NOT_FOUND",
        message:"Email not found"
      }
    });
  }

  const isVerified = user.isVerified;

  if(!isVerified){
    return res.status(400).json({
      success:false,
      error:{
        code:"USER_NOT_VERIFIED",
        message:"User not verified please verify your email"
      }
    });
  }

  next();
}