const express = require('express');
const router = express.Router();
const verifySignUp = require('../middlewares/verifySignUp');
const authController = require('../controllers/auth.controller');

router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail], authController.signup);
router.post('/signin', authController.signin);
router.get('/users', authController.getUsers);
router.post('/resetpassword', authController.resetpassword);

module.exports = router;
