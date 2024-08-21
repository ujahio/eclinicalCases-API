import { submitCaseAnswers, getStudentsAnswers } from "../src/controllers/quiz.controller.js";
import { verifyToken } from "../src/middlewares/auth.js";

export const submitHandler = async (event) => {
  const body = JSON.parse(event.body);
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await submitCaseAnswers(body);
};

export const getAnswersHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getStudentsAnswers(caseID);
};
