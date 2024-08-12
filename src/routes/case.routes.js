import express from "express";
const router = express.Router();
import { upload } from "../middlewares/uploadFile.js";
import { verifyToken } from "../middlewares/auth.js";
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
} from "../controllers/case.controller.js";

router.get("/details/:caseID", verifyToken, getCase);
router.get("/all/", verifyToken, getCases);
router.get("/ongoing-case/", verifyToken, getOngoingCase);
router.post("/add", verifyToken, upload.array("caseMaterials", 10), addCase);
router.post("/update/:caseID", verifyToken, upload.array("caseMaterials", 10), updateCase);
router.post("/duplicate", verifyToken, upload.array("caseMaterials", 10), duplicateCase);
router.post("/publish/", verifyToken, publishCase);
router.post("/add/feedback/", verifyToken, addFeedback);
router.get("/feedbacks/:caseID", verifyToken, getCaseFeedback);
router.get("/responses/:caseID", verifyToken, getCaseAnswers);
router.get("/data/:caseID", verifyToken, getCaseData);
router.get("/student/attempts/:studentID", verifyToken, getCaseAttemptsByStudent);

router.delete("/delete-case/:caseID", verifyToken, deleteCase);
router.delete("/delete/all/", deleteAllCases);

export default router;
