const express = require('express');
const router = express.Router();
const verifySignUp = require('../middlewares/verifySignUp');
const { verifyToken } = require("../middlewares/auth");
const authController = require('../controllers/auth.controller');

router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail], authController.signup);
router.post('/signin', authController.signin);
router.get('/users', authController.getUsers);
router.post('/send-otp', authController.sendOTP);
router.post('/reset-password', authController.verifyOtpAndResetPassword);
router.post('/update-password', verifyToken, authController.updatePassword);

module.exports = router;
