import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import path from "path";

import authRoutes from "./server/routes/auth.routes.js";
import caseRoutes from "./server/routes/case.routes.js";
import quizRoutes from "./server/routes/quiz.routes.js";
import studentRoutes from "./server/routes/student.routes.js";
import {
  getUsers,
  sendOTP,
  signin,
  signup,
  updatePassword,
  verifyOtpAndResetPassword,
} from "./server/controllers/auth.controller.js";
import {
  addCase,
  updateCase,
  getCases,
  getCase,
  getOngoingCase,
  deleteCase,
  deleteAllCases,
  duplicateCase,
  publishCase,
  addFeedback,
  getCaseFeedback,
  getCaseAnswers,
  getCaseAttemptsByStudent,
  getCaseData,
} from "./server/controllers/case.controller.js";
import { checkDuplicateUsernameOrEmail } from "./server/middlewares/verifySignUp.js";
import { verifyToken } from "./server/middlewares/auth.js";
import { upload } from "./server/middlewares/uploadFile.js";
import { getStudentsAnswers, submitCaseAnswers } from "./server/controllers/quiz.controller.js";
import { getCertificateByCaseID, getStudentCertificates } from "./server/controllers/student.controller.js";

const app = express();

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Auth
app.post("/signin", signin);
app.post("/signup", [checkDuplicateUsernameOrEmail], signup);
app.get("/users", getUsers);
app.post("/send-otp", sendOTP);
app.post("/reset-password", verifyOtpAndResetPassword);
app.post("/update-password", verifyToken, updatePassword);

// Cases
app.get("/details/:caseID", verifyToken, getCase);
app.get("/all/", verifyToken, getCases);
app.get("/ongoing-case/", verifyToken, getOngoingCase);
app.post("/add", verifyToken, upload.array("caseMaterials", 10), addCase);
app.post("/update/:caseID", verifyToken, upload.array("caseMaterials", 10), updateCase);
app.post("/duplicate", verifyToken, upload.array("caseMaterials", 10), duplicateCase);
app.post("/publish/", verifyToken, publishCase);
app.post("/add/feedback/", verifyToken, addFeedback);
app.get("/feedbacks/:caseID", verifyToken, getCaseFeedback);
app.get("/responses/:caseID", verifyToken, getCaseAnswers);
app.get("/data/:caseID", verifyToken, getCaseData);
app.get("/student/attempts/:studentID", verifyToken, getCaseAttemptsByStudent);
app.delete("/delete-case/:caseID", verifyToken, deleteCase);
app.delete("/delete/all/", deleteAllCases);

// Quiz
app.post("/submit", verifyToken, submitCaseAnswers);
app.get("/answers/:caseID", verifyToken, getStudentsAnswers);

// Student
app.get("/certificates", verifyToken, getStudentCertificates);
app.get("/certificate/:caseID", verifyToken, getCertificateByCaseID);

app.use("/api/auth", authRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/student", studentRoutes);
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

export const handler = serverless(app);
