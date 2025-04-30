import express from "express";
import { registerUser, verifyEmail } from "../controllers/auth.controllers.js";


const authRoutes = express.Router();

// Email verification should come before other routes
authRoutes.get("/verify-email/:token", verifyEmail);

authRoutes.post("/register",registerUser);
authRoutes.post("/login",registerUser);
authRoutes.post("/logout",registerUser);
authRoutes.get("/profile",registerUser);

export default authRoutes