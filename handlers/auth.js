import {
  signin,
  signup,
  getUsers,
  sendOTP,
  verifyOtpAndResetPassword,
  updatePassword,
} from "../src/controllers/auth.controller.js";
import { checkDuplicateUsernameOrEmail } from "../src/middlewares/verifySignUp.js";
import { verifyToken } from "../src/middlewares/auth.js";

export const signinHandler = async (event) => {
  const body = JSON.parse(event.body);
  return await signin(body);
};

export const signupHandler = async (event) => {
  const body = JSON.parse(event.body);
  console.log("body: ", body)
  await checkDuplicateUsernameOrEmail(body);
  return await signup(body);
};

export const getUsersHandler = async () => {
  return await getUsers();
};

export const sendOtpHandler = async (event) => {
  const body = JSON.parse(event.body);
  return await sendOTP(body);
};

export const resetPasswordHandler = async (event) => {
  const body = JSON.parse(event.body);
  return await verifyOtpAndResetPassword(body);
};

export const updatePasswordHandler = async (event) => {
  const body = JSON.parse(event.body);
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await updatePassword(body);
};
