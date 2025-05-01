import jwt from "jsonwebtoken";

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({id:userId} , process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign({id:userId}, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });

  return { accessToken, refreshToken };
};
export default generateTokens