import { combineReducers } from "@reduxjs/toolkit";
import loginSlice from "../slices/auth/loginSlice";
import signupSlice from "../slices/auth/signupSlice";
import addCaseSlice from "../slices/case/addCaseSlice";
import updateDraftCaseSlice from "../slices/case/updateDraftCaseSlice";
import getArchiveCasesSlice from "../slices/case/getArchiveCasesSlice";
import caseDetailsSlice from "../slices/case/caseDetailsSlice";
import SubmitCaseResponseSlice from "../slices/student/SubmitCaseResponseSlice";
import addFeedbackSlice from "../slices/student/addFeedbackSlice";
import sendOtpSlice from "../slices/auth/sendOtpSlice";
import resetPasswordSlice from "../slices/auth/resetPasswordSlice";
import getPublishedCaseSlice from "../slices/case/getPublishedCaseSlice";
import deleteCaseSlice from "../slices/case/deleteCaseSlice";
import getCaseDataSlice from "../slices/case/getCaseDataSlice";
import changePasswordSlice from "../slices/auth/changePasswordSlice";
import getDraftCasesSlice from "../slices/case/getDraftCasesSlice";
import getStudentsResponsesToCasesSlice from "../slices/student/getStudentsResponsesToCasesSlice";
import urlToProcessCaseMaterialsSlice from "../slices/case/getUrlToProcessCaseMaterialsSlice";

const rootReducer = combineReducers({
	// Accounts
	login: loginSlice,
	signup: signupSlice,
	sendOtp: sendOtpSlice,
	resetPassword: resetPasswordSlice,
	changePassword: changePasswordSlice,
	// case
	addCase: addCaseSlice,
	updateDraftCase: updateDraftCaseSlice,
	getArchiveCases: getArchiveCasesSlice,
	caseDetails: caseDetailsSlice,
	activeCase: getPublishedCaseSlice,
	deleteCase: deleteCaseSlice,
	getCaseData: getCaseDataSlice,
	getDraftCases: getDraftCasesSlice,
	urlToAddCaseMaterials: urlToProcessCaseMaterialsSlice,
	// student
	submitCaseResponse: SubmitCaseResponseSlice,
	studentsResponsesToCases: getStudentsResponsesToCasesSlice,
	addFeedback: addFeedbackSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
