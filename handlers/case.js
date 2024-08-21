import {
  getCase,
  getCases,
  getOngoingCase,
  addCase,
  updateCase,
  deleteCase,
  deleteAllCases,
  duplicateCase,
  publishCase,
  addFeedback,
  getCaseFeedback,
  getCaseAnswers,
  getCaseData,
  getCaseAttemptsByStudent,
} from "../src/controllers/case.controller.js";
import { verifyToken } from "../src/middlewares/auth.js";
import { upload } from "../src/middlewares/uploadFile.js";

export const getCaseHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCase(caseID);
};

export const getCasesHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCases();
};

export const getOngoingCaseHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getOngoingCase();
};

export const addCaseHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  const formData = event.body; // Assuming formData is parsed appropriately
  return await addCase(formData, upload.array("caseMaterials", 10));
};

export const updateCaseHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  const formData = event.body; // Assuming formData is parsed appropriately
  return await updateCase(caseID, formData, upload.array("caseMaterials", 10));
};

export const deleteCaseHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await deleteCase(caseID);
};

export const deleteAllCasesHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await deleteAllCases();
};

export const duplicateCaseHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  const formData = event.body; // Assuming formData is parsed appropriately
  return await duplicateCase(formData);
};

export const publishCaseHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  const formData = event.body; // Assuming formData is parsed appropriately
  return await publishCase(formData);
};

export const addFeedbackHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  const feedbackData = event.body; // Assuming feedbackData is parsed appropriately
  return await addFeedback(feedbackData);
};

export const getCaseFeedbackHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCaseFeedback(caseID);
};

export const getCaseAnswersHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCaseAnswers(caseID);
};

export const getCaseDataHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCaseData(caseID);
};

export const getCaseAttemptsByStudentHandler = async (event) => {
  const studentID = event.pathParameters.studentID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCaseAttemptsByStudent(studentID);
};
