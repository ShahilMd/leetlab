import express from "express";
import isLoggedin from "../middlewares/isLoggedin.js";
import { getAllSubmissions, getAllTheSubmissionsForProblem, getSubmissionForProblem } from "../controllers/submission.controller.js";

const submissionRoutes = express.Router();

submissionRoutes.get("/get-all-submissions", isLoggedin,getAllSubmissions);

submissionRoutes.get("/get-submission/:problemId",isLoggedin,getSubmissionForProblem)

submissionRoutes.get("/get-submission-count/:problemId", isLoggedin, getAllTheSubmissionsForProblem)


export default submissionRoutes