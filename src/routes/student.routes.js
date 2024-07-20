const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const studentController = require("../controllers/student.controller");

router.get(
    "/certificates",
    verifyToken,
    studentController.getStudentCertificates
);

module.exports = router;
