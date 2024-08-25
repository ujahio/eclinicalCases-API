import express from "express";
const router = express.Router();
import { checkDuplicateUsernameOrEmail } from "../middlewares/verifySignUp.js";
import { verifyToken } from "../middlewares/auth.js";
import {
  signup,
  signin,
  sendOTP,
  verifyOtpAndResetPassword,
  getUsers,
  updatePassword,
} from "../controllers/auth.controller.js";

router.post("/signup", [checkDuplicateUsernameOrEmail], signup);
router.post("/signin", signin);
router.get("/users", getUsers);
router.post("/send-otp", sendOTP);
router.post("/reset-password", verifyOtpAndResetPassword);
router.post("/update-password", verifyToken, updatePassword);

export default router;
