import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";
import generateTokens from "../utils/TokenGenerator.js";

const isLoggedin = async (req, res, next) => {
  const {refToken,accToken} = req.cookies
  try {
  

  if(!accToken){
    if(!refToken){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from refresh token"
      });
    }

    const decodedToken = jwt.verify(refToken,process.env.REFRESH_TOKEN_SECRET)

    const user =await db.user.findUnique({
      where:{id:decodedToken.id},
      select:{
        id:true,
        image:true,
        name:true,
        email:true,
        role:true
      }
    });
    console.log(user.email)
    if(!user){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from user not found part"
      });
    }
    const {accessToken,refreshToken} = generateTokens(user.id)

      await db.user.update({
        where:{id:user.id},
        data:{refreshToken}
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
      req.user = user;
      next();
  }else{
    const decodedToken = jwt.verify(accToken,process.env.ACCESS_TOKEN_SECRET)

    const user =await db.user.findUnique({
      where:{id:decodedToken.id},
      select:{
        id:true,
        image:true,
        name:true,
        email:true,
        role:true
      }
    });
    if(!user){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from else condition user"
      });
    }
    const {accessToken,refreshToken} = generateTokens(user.id)

      await db.user.update({
        where:{id:user.id},
        data:{refreshToken}
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
    req.user = user;
    next();
  }
} catch (error) {
  console.error("Error verifying token:", error);
  return res.status(500).json({
    status: false,
    message: "Internal server error",
  })
}
  
}
export default isLoggedin