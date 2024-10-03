import { bucket } from "./storage";
// import { email } from "./email";
import {
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
} from "./secrets";

import {
	Users,
	Cases,
	Feedback,
	Answers,
	Certificates,
	StudentCaseAttempts,
} from "./dynamo";

const links = [
	Users,
	Cases,
	Feedback,
	Answers,
	Certificates,
	StudentCaseAttempts,
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
	// email,
	bucket,
];

const STAGE = $app.stage;
const domainName =
	STAGE === "production"
		? "api.eccs-online.com"
		: `${STAGE}-api.eccs-online.com`;

export const api = new sst.aws.ApiGatewayV2("MyApi", {
	domain: domainName,
	cors: true,
});

// Auth
api.route("POST /api/auth/signin", {
	handler: "server/controllers/auth.controller.signin",
	link: links,
});
api.route("POST /api/auth/signup", {
	handler: "server/controllers/auth.controller.signup",
	link: links,
});
api.route("POST /api/auth/send-otp", {
	handler: "server/controllers/auth.controller.sendOTP",
	link: links,
});
api.route("POST /api/auth/reset-password", {
	handler: "server/controllers/auth.controller.verifyOtpAndResetPassword",
	link: links,
});
api.route("POST /api/auth/update-password", {
	handler: "server/controllers/auth.controller.updatePassword",
	link: links,
});
api.route("GET /api/auth/users", {
	handler: "server/controllers/auth.controller.getUsers",
	link: links,
});

// Case
api.route("GET /api/case/details/{caseID}", {
	handler: "server/controllers/case.controller.getCase",
	link: links,
});
api.route("GET /api/case/all/{caseStatus}", {
	handler: "server/controllers/case.controller.getCases",
	link: links,
});
api.route("GET /api/case/ongoing-case", {
	handler: "server/controllers/case.controller.getOngoingCase",
	link: links,
});
api.route("POST /api/case/add", {
	handler: "server/controllers/case.controller.addCase",
	link: links,
	memory: "2048 MB",
	// binaryMediaTypes: ["*/*"],
});
api.route("POST /api/case/update/{caseID}", {
	handler: "server/controllers/case.controller.updateCase",
	link: links,
});
api.route("POST /api/case/duplicate", {
	handler: "server/controllers/case.controller.duplicateCase",
	link: links,
});
api.route("POST /api/case/publish", {
	handler: "server/controllers/case.controller.publishCase",
	link: links,
});
api.route("POST /api/case/add/feedback", {
	handler: "server/controllers/case.controller.addFeedback",
	link: links,
});
api.route("GET /api/case/feedbacks/{caseID}", {
	handler: "server/controllers/case.controller.getCaseFeedback",
	link: links,
});
api.route("GET /api/case/responses/{caseID}", {
	handler: "server/controllers/case.controller.getCaseAnswers",
	link: links,
});
api.route("GET /api/case/data/{caseID}", {
	handler: "server/controllers/case.controller.getCaseData",
	link: links,
});
api.route("GET /api/case/student/attempts/{studentID}", {
	handler: "server/controllers/case.controller.getCaseAttemptsByStudent",
	link: links,
});
api.route("DELETE /api/case/delete-case/{caseID}", {
	handler: "server/controllers/case.controller.deleteCase",
	link: links,
});
// api.route("DELETE /api/case/delete/all/", {
//   handler: "handler.handler",
//   link: links,
// });

// Quiz
api.route("POST /api/quiz/submit", {
	handler: "server/controllers/quiz.controller.submitCaseAnswers",
	link: links,
});
api.route("GET /api/quiz/answers/{caseID}", {
	handler: "server/controllers/quiz.controller.getStudentsAnswers",
	link: links,
});
api.route("POST /api/quiz/generate-certificate", {
	handler: "server/controllers/student.controller.generatePassingCertificate",
	link: links,
});

// Student
api.route("GET /api/student/certificates", {
	handler: "server/controllers/student.controller.getStudentCertificates",
	link: links,
});
api.route("GET /api/student/certificate/{caseID}", {
	handler: "server/controllers/student.controller.getCertificateByCaseID",
	link: links,
});
