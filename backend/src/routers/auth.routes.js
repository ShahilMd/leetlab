import express from "express";
import { loginUser, logout, registerUser, userProfile, verifyEmail } from "../controllers/auth.controllers.js";
import { loginValidator, registerValidator } from "../utils/validators.js";
import { isVerified } from "../middlewares/isverified.js";
import  isLoggedin  from "../middlewares/isLoggedin.js";


const authRoutes = express.Router();

// Email verification should come before other routes
authRoutes.get("/verify-email/:token", verifyEmail);

authRoutes.post("/register",registerValidator,registerUser);
authRoutes.post("/login",isVerified,loginValidator,loginUser);
authRoutes.get("/profile",isLoggedin,userProfile);
authRoutes.post("/logout",isLoggedin,logout);

export default authRoutes