import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import crypto, { verify } from "crypto";
import { UserRole } from "../generated/prisma/index.js";
import sendVerificationemail from "../services/email.service.js";
import generateTokens from "../utils/TokenGenerator.js";
import { clear } from "console";


export const registerUser = async(req,res)=>{
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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
        verificationTokenExpiry,
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
  
  const {token} = req.params
  try {
    console.log(token)
    if(!token){
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid Token",
          details: "No Token Found Please Register First",
        },
      });

    }
 
    const user = await await db.user.findFirst({
      where:{
        verificationToken:token,
        verificationTokenExpiry: {
          gt: new Date()
        }
      },
    })
    if(!user){
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid Verification Token",
          details: "Please request a new verification email",
        },
      });

    }

   await db.user.update({
    where: { id: user.id },
    data:{
      isVerified:true,
      verificationToken:null,
      verificationTokenExpiry:null
    }
   })
   return res.status(201).json({
    status: true,
    message: "Email verified successfully",
  })

  } catch (error) {
  return res.status(500).json({
    sucesses:false,
    error:error.message
  })
}
}

export const loginUser = async(req,res)=>{
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  const {email,password} = req.body;

  try {
    const user = await db.user.findUnique({
      where:{email}
    });

    if(!user){
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid Email or Password",
          details: "Please use a different email or password and try again"
        }
      });
    }

    const matchPassword = await bcrypt.compare(password,user.password);

    if(!matchPassword){
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid Email or Password",
          details: "Please use a different email or password and try again"
        }
      });
    }

    const {accessToken,refreshToken} = generateTokens(user.id)

    await db.user.update({
      where:{email},
      data:{
        refreshToken
      }
    })

    const cookieOptionsAccessToken = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 5 * 60 * 1000, // 5 minutes for access token
    };
    
    const cookieOptionsRefreshToken = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    };
  
    res.cookie('accToken',accessToken,cookieOptionsAccessToken)
    res.cookie('refToken',refreshToken,cookieOptionsRefreshToken)


   
    return res.status(200).json({
      status: true,
      message: "User logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role:user.role
      },
    })
  } catch (error) {
    return res.status(500).json({
      sucesses:false,
      message:"something went wrong",
      error:error.message
    })
  }
  
}

export const userProfile = async(req,res)=>{
  try {
    // this decoded token come from isLoggedin middleware 
    const user = req.user


    if(!user){
      return res.status(401).json({
        success:false,
        message:"Unauthorized Access"
      })
    }
    return res.status(200).json({
      status: true,
      message: "User Profile",
      user:user
    })
  } catch (error) {
    return res.status(500).json({
      sucesses:false,
      message:"something went wrong",
      error:error.message
    })
  }
}

export const logout = async (req,res)=>{
  const user = req.user
  if(!user){
    return res.status(401).json({
      success:false,
      message:"Unauthorized Access"
    })
  }

  await db.user.update({
    where:{id:user.id},
    data:{refreshToken:null}
  })
  res.clearCookie('accToken')
  res.clearCookie('refToken')
  return res.status(200).json({
    status: true,
    message: "User logged out successfully",
  })

}