import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto, { verify } from "crypto";
import { UserRole } from "../generated/prisma/index.js";
import sendVerificationemail from "../services/email.service.js";



export const registerUser =async(req,res)=>{
  const {name,email,password} = req.body

  const isEmail = validator.isEmail(email);
  const isPassword = validator.isLength(password, { min: 6 }) &&
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
  const isName = validator.isAlphanumeric(name) && name.trim().length > 0;

  if (!isEmail || !isName) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Invalid input",
        details: "Please provide a valid email address and name",
      },
    });
  }

  if (!isPassword) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PASSWORD",
        message: "Invalid password",
        details: "Please provide a strong password",
      },
    });
  }
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
    const token = crypto.randomBytes(64).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes-
    await sendVerificationemail(name,email,token,verificationTokenExpiry) // verification link send to user email

    const newUser = await db.user.create({
      data:{
        name,
        email,
        password:hasedPassword,
        role:UserRole.USER,
        verificationToken:token,
        verificationTokenExpiry
      }
    })
    if (!newUser) {
      return res.status(402).json({
        status: false,
        message: "User registration failed",
      });
    }

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

export const  verifyEmail = async(req,res)=>{

  try {
    
  
  const {token} = req.params
  console.log(token)
  return res.status(200).json({
    sucesses:true
  })
} catch (error) {
  return res.status(500).json({
    sucesses:false,
    error:error.message
  })
}
}