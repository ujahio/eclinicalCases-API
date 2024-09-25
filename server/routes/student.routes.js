import express from "express";
const router = express.Router();
import { verifyToken } from "../middlewares/auth.js";
import {
	getStudentCertificates,
	getCertificateByCaseID,
	newCaseNotification,
} from "../controllers/student.controller.js";

router.get("/certificates", verifyToken, getStudentCertificates);
router.get("/certificate/:caseID", verifyToken, getCertificateByCaseID);

export default router;
