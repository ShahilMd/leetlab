import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routers/auth.routes.js";
import "./utils/deleteUnverifiedUsers.js";
import problemRoutes from "./routers/problem.route.js";
import executionRoutes from "./routers/execution.route.js";



dotenv.config();

const app = express();

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000",
}));

const port = process.env.PORT || 3000;

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/problems" , problemRoutes)
app.use("/api/v1/execute-code" ,executionRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 