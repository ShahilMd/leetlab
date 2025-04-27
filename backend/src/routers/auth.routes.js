import express from "express";
import { registerUser } from "../controllers/auth.controllers.js";


const authRoutes = express.Router();

authRoutes.post("/register",registerUser);

authRoutes.post("/login",registerUser);
authRoutes.post("/logout",registerUser);
authRoutes.get("/profile",registerUser);

export default authRoutes