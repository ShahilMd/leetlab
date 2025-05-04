import express from "express";
import { createProblem, deleteProblem, getAllProblems, getAllProblemsSolvedByUser, getProblemById, updateProblem } from "../controllers/problem.controller.js";
import isLoggedin from "../middlewares/isLoggedin.js";
import checkAdmin from "../middlewares/checkAdmin.js";

const problemRoutes = express.Router();

problemRoutes.post("/create-problem" , isLoggedin , checkAdmin , createProblem)

problemRoutes.get("/get-all-problems", isLoggedin , getAllProblems);

problemRoutes.get("/get-problem/:id", isLoggedin , getProblemById);


problemRoutes.put("/update-problem/:id", isLoggedin , checkAdmin ,updateProblem)


problemRoutes.delete("/delete-problem/:id", isLoggedin , checkAdmin ,deleteProblem)

problemRoutes.get("/get-solved-problems", isLoggedin , getAllProblemsSolvedByUser);

export default problemRoutes;