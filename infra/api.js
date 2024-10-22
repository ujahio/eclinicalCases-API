// import { email } from "./email";
import { CaseMaterials, ECCSUsersCertificates } from "./storage";
import {
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
} from "./secrets";

import {
	ECCSUsers,
	Feedback,
	StudentsResponses,
	TeacherCaseStudies,
} from "./dynamo";

const links = [
	ECCSUsers,
	Feedback,
	StudentsResponses,
	TeacherCaseStudies,
	CaseMaterials,
	ECCSUsersCertificates,
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
];

const STAGE = $app.stage;
const domainName =
	STAGE === "production"
		? "api.eccs-online.com"
		: `${STAGE}-api.eccs-online.com`;

export const api = new sst.aws.ApiGatewayV2("eclinicalCasesSolutions", {
	domain: domainName,
	cors: true,
});

// Auth
api.route("POST /api/auth/signin", {
	link: links,
	handler: "server/controllers/auth.controller.signin",
});
api.route("POST /api/auth/signup", {
	link: links,
	handler: "server/controllers/auth.controller.signup",
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

// is this route needed?
// api.route("GET /api/auth/users", {
// 	handler: "server/controllers/auth.controller.getUsers",
// 	link: [
// 		ECCSUsers,

// 		Feedback,
// 		StudentsResponses,
// 		Certificates,

// 		TeacherCaseStudies,
// 		NEXT_JWT_SECRET,
// 		NEXT_PUBLIC_PASS_SECRET_KEY,
// 		NEXT_PUBLIC_BASE_URL,
// 		NEXT_PUBLIC_NODE_ENV,
// 		// email,
// 		bucket,
// 	],
// });

//Case;
api.route("GET /api/case/details/{caseID}", {
	handler: "server/controllers/case.controller.getCaseForStudentsResponse",
	link: links,
});
api.route("GET /api/case/archived/{caseFilter}", {
	handler: "server/controllers/handleArchivedCases.getArchivedCases",
	link: links,
});
api.route("GET /api/case/publish", {
	handler: "server/controllers/handlePublishedCase.getPublishedCase",
	link: links,
});
api.route("POST /api/case/publish", {
	handler: "server/controllers/handlePublishedCase.publishCase",
	link: links,
});
api.route("GET /api/case/get-signed-url-for-pdf-upload", {
	handler:
		"server/controllers/handleCaseMaterials.getSignedUrlToUploadForCaseMaterials",
	link: links,
});

api.route("POST /api/case/get-signed-url-for-pdf-fetch", {
	handler:
		"server/controllers/handleCaseMaterials.getSignedUrlsToFetchForCaseMaterials",
	link: links,
});

api.route("DELETE /api/case/delete-case-material", {
	handler: "server/controllers/handleCaseMaterials.deleteCaseMaterial",
	link: links,
});

api.route("GET /api/case/draft/{caseId}", {
	handler: "server/controllers/handleDraftCases.getDraftCases",
	link: links,
});

api.route("POST /api/case/draft", {
	handler: "server/controllers/handleDraftCases.addDraftCase",
	link: links,
});
api.route("PUT /api/case/draft/{caseID}", {
	handler: "server/controllers/handleDraftCases.updateDraftCase",
	link: links,
});
api.route("DELETE /api/case/delete-case/{caseID}", {
	handler: "server/controllers/handleDraftCases.deleteDraftCase",
	link: links,
});

api.route("POST /api/case/duplicate", {
	handler: "server/controllers/case.controller.duplicateCase",
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

// Student;
api.route("GET /api/student/certificates", {
	handler: "server/controllers/student.controller.getStudentCertificates",
	link: links,
});
api.route("GET /api/student/certificate/{caseID}", {
	handler: "server/controllers/student.controller.getCertificateByCaseID",
	link: links,
});
api.route("GET /api/student/responses/{caseFilter}", {
	handler: "server/controllers/student.controller.getStudentsResponses",
	link: links,
});

api.route("POST /api/student/response", {
	handler: "server/controllers/student.controller.submitStudentResponse",
	link: links,
	runtime: "nodejs18.x",
	copyFiles: [
		{
			from: "./server/assets/images/logo.png",
			to: "assets/images/logo.png",
		},
	],
});
