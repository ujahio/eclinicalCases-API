const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadFile");
const { verifyToken } = require("../middlewares/auth");
const caseController = require("../controllers/case.controller");

router.get("/details/:caseId", verifyToken, caseController.getCase);
router.get("/all/", verifyToken, caseController.getCases);
router.post(
  "/add",
  verifyToken,
  upload.array("caseMaterials", 10),
  caseController.addCase
);
router.post(
  "/update/:caseId",
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
  "/feedbacks/:caseId",
  verifyToken,
  caseController.getCaseFeedback
);
router.delete("/delete-case/:caseId", verifyToken, caseController.deleteCase);
router.delete("/delete/all/", caseController.deleteAllCases);

module.exports = router;
