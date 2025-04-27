import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";


import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/index.js";



export const registerUser =async(req,res)=>{
  const {name,email,password} = req.body
  try {
    const isExist = await db.user.findUnique({
      where:{email}
    })
    if(isExist){
      return res.status(400).json({
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: "A user with this email/username already exists",
          details: "Please use a different email or try logging in instead"
        }
      });
    }

    const hasedPassword = await bcrypt.hash(password,12)

    const newUser = await db.user.create({
      data:{
        name,
        email,
        password:hasedPassword,
        role:UserRole.USER,}
    })
    if (!newUser) {
      return res.status(402).json({
        status: false,
        message: "User registration failed",
      });
    }

    const token = jwt.sign({id:newUser.id},process.env.JWT_SECRETE,{expiresIn:"1d"})

    res.cookie("jwt",token, {
      httpOnly:true,
      sameSite:"strict",
      secure:process.env.NODE_ENV !== "devlopment",
      maxAge:1000 * 60 * 60 * 24 // 1 days
    })

    return res.status(201).json({
      status: true,
      message: "User registered successfully, please verify your email address",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role:newUser.role
      },
    });



  
    
  } catch (error) {
    return res.status(500).json({
      sucesses:false,
      message:"something went wrong",
      error:error.message
    })
    
  }
}