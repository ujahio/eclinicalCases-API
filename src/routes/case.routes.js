const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadFile");
const { verifyToken } = require("../middlewares/auth");
const caseController = require("../controllers/case.controller");

router.get("/details/:caseID", verifyToken, caseController.getCase);
router.get("/all/", verifyToken, caseController.getCases);
router.post(
  "/add",
  verifyToken,
  upload.array("caseMaterials", 10),
  caseController.addCase
);
router.post(
  "/update/:caseID",
  verifyToken,
  upload.array("caseMaterials", 10),
  caseController.updateCase
);
router.post(
  "/duplicate",
  verifyToken,
  upload.array("caseMaterials", 10),
  caseController.duplicateCase
);
router.post(
  "/publish/",
  verifyToken,
  caseController.publishCase
);
router.post(
  "/add/feedback/",
  verifyToken,
  caseController.addFeedback
);
router.get(
  "/feedbacks/:caseID",
  verifyToken,
  caseController.getCaseFeedback
);
router.get(
  "/responses/:caseID",
  verifyToken,
  caseController.getCaseAnswers
);
router.get(
  "/student/attempts/:studentID",
  verifyToken,
  caseController.getCaseAttemptsByStudent
);

router.delete("/delete-case/:caseID", verifyToken, caseController.deleteCase);
router.delete("/delete/all/", caseController.deleteAllCases);

module.exports = router;
