import { db } from "../libs/db.js";
import jwt from "jsonwebtoken";
import generateTokens from "../utils/TokenGenerator.js";

const isLoggedin = async (req, res, next) => {
  try {
  const {refreshToken,accessToken} = req.cookies
  console.log(refreshToken,accessToken);
  

  if(!accessToken){
    if(!refreshToken){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from refresh token"
      });
    }

    const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)

    const user =await db.user.findUnique({where:{id:decodedToken.id}})
    console.log(user.email)
    if(!user){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from user not found part"
      });
    }
    const {accessToken,refreshToken} = generateTokens(user.id)

      awaitdb.user.update({
        where:{id:user.id},
        data:{refreshToken}
      })
      

      const cookieOptions = {
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none':'strict',
      }
    
      res.cookie('accessToken',accessToken,cookieOptions)
      res.cookie('refreshToken',refreshToken,cookieOptions)
      req.user = decodedToken;
      next();
  }else{
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)

    const user =await db.user.findUnique({where:{id:decodedToken.id}}) 
    if(!user){
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        details:"this is error from else condition user"
      });
    }
    const {accessToken,refreshToken} = generateTokens(user.id)

      awaitdb.user.update({
        where:{id:user.id},
        data:{refreshToken}
      })

    const cookieOptions = {
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'production' ? 'none':'strict',
    }
  
    res.cookie('accessToken',accessToken,cookieOptions)
    res.cookie('refreshToken',refreshToken,cookieOptions)
    req.user = decodedToken;
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