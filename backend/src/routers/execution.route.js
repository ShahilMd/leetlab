import express from "express";
import isLoggedin from "../middlewares/isLoggedin.js";
import { runCode, submitCode } from "../controllers/execution.controllers.js";


const executionRoutes = express.Router();

executionRoutes.post("/run-code", isLoggedin, runCode);

executionRoutes.post("/submit-code ", isLoggedin, submitCode);

export default executionRoutes;