import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";
import generateTokens from "../utils/TokenGenerator.js";
import { redis } from "../index.js";

const isLoggedin = async (req, res, next) => {
  const {refToken,accToken} = req.cookies

  try {
  

  if(!accToken){
    if(!refToken){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"Please login.."
      });
    }
   

    const decodedToken = jwt.verify(refToken,process.env.REFRESH_TOKEN_SECRET)

    await redis.del(decodedToken.id)

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
        details:"this is error from user not found part"
      });
    }

    const {accessToken,refreshToken} = generateTokens(user.id)

      await db.user.update({
        where:{id:user.id},
        data:{refreshToken}
      })
      
      await redis.set(user.id,user)

      const cookieOptionsAccessToken = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 30 * 60 * 1000, // 30 minutes for access token
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
    
    const user =await redis.get(decodedToken.id)

    if(!user){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from else condition user"
      });
    }

    req.user = user;
    console.log('data comming fron cache');
    
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