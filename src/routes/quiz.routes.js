const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadFile");
const { verifyToken } = require("../middlewares/auth");
const quizController = require("../controllers/quiz.controller");

router.post(
    "/submit",
    verifyToken,
    quizController.submitQuiz
);
router.get(
    "/answers/:caseID",
    verifyToken,
    quizController.getStudentsAnswers
);

module.exports = router;
