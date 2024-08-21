import { getCertificateByCaseID, getStudentCertificates } from "../src/controllers/student.controller.js";
import { verifyToken } from "../src/middlewares/auth.js";

export const getCertificatesHandler = async (event) => {
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getStudentCertificates();
};

export const getCertificateByCaseIDHandler = async (event) => {
  const caseID = event.pathParameters.caseID;
  const token = event.headers.Authorization;
  await verifyToken(token);
  return await getCertificateByCaseID(caseID);
};
