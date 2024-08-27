import { combineReducers } from "@reduxjs/toolkit";
import loginSlice from "../slices/auth/loginSlice";
import signupSlice from "../slices/auth/signupSlice";
import addCaseSlice from "../slices/case/addCaseSlice";
import updateCaseSlice from "../slices/case/updateCaseSlice";
import getAllCasesSlice from "../slices/case/getAllCasesSlice";
import caseDetailsSlice from "../slices/case/caseDetailsSlice";
import SubmitCaseResponseSlice from "../slices/student/SubmitCaseResponseSlice";
import addFeedbackSlice from "../slices/student/addFeedbackSlice";
import sendOtpSlice from "../slices/auth/sendOtpSlice";
import resetPasswordSlice from "../slices/auth/resetPasswordSlice";
import onGoingCaseSlice from "../slices/case/onGoingCaseSlice";
import deleteCaseSlice from "../slices/case/deleteCaseSlice";
import getCaseDataSlice from "../slices/case/getCaseDataSlice";
import changePasswordSlice from "../slices/auth/changePasswordSlice";

const rootReducer = combineReducers({
  // Accounts
  login: loginSlice,
  signup: signupSlice,
  sendOtp: sendOtpSlice,
  resetPassword: resetPasswordSlice,
  changePassword: changePasswordSlice,
  // case
  addCase: addCaseSlice,
  updateCase: updateCaseSlice,
  getAllCases: getAllCasesSlice,
  caseDetails: caseDetailsSlice,
  onGoingCase: onGoingCaseSlice,
  deleteCase: deleteCaseSlice,
  getCaseData: getCaseDataSlice,
  // student
  submitCaseResponse: SubmitCaseResponseSlice,
  addFeedback: addFeedbackSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
