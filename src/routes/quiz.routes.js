import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/auth.js";
import { submitCaseAnswers, getStudentsAnswers } from "../controllers/quiz.controller.js";

router.post("/submit", verifyToken, submitCaseAnswers);
router.get("/answers/:caseID", verifyToken, getStudentsAnswers);

export default router;
