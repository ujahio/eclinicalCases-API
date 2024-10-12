// import { bucket } from "./storage";
// import { email } from "./email";
import {
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
} from "./secrets";

import {
	Users_Table,
	Feedback,
	StudentsResponses,
	Certificates,
	TeacherCaseStudies,
} from "./dynamo";

// TODO: link only the resources each route needs
// const link = [
// 	Users_Table,
// 	Feedback,
// 	StudentsResponses,
// 	Certificates,
// 	TeacherCaseStudies,
// 	NEXT_JWT_SECRET,
// 	NEXT_PUBLIC_PASS_SECRET_KEY,
// 	NEXT_PUBLIC_BASE_URL,
// 	NEXT_PUBLIC_NODE_ENV,
// 	// email,
// 	bucket,
// ];

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
	handler: "server/controllers/auth.controller.signin",
	link: [Users_Table, NEXT_JWT_SECRET, NEXT_PUBLIC_PASS_SECRET_KEY],
});
api.route("POST /api/auth/signup", {
	handler: "server/controllers/auth.controller.signup",
	link: [Users_Table, NEXT_JWT_SECRET, NEXT_PUBLIC_PASS_SECRET_KEY],
});
// api.route("POST /api/auth/send-otp", {
// 	handler: "server/controllers/auth.controller.sendOTP",
// 	link: [
// 		Users_Table,

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
// api.route("POST /api/auth/reset-password", {
// 	handler: "server/controllers/auth.controller.verifyOtpAndResetPassword",
// 	link: [
// 		Users_Table,

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
// api.route("POST /api/auth/update-password", {
// 	handler: "server/controllers/auth.controller.updatePassword",
// 	link: [
// 		Users_Table,

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

// is this route needed?
// api.route("GET /api/auth/users", {
// 	handler: "server/controllers/auth.controller.getUsers",
// 	link: [
// 		Users_Table,

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

// Case
api.route("GET /api/case/details/{caseID}", {
	handler: "server/controllers/case.controller.getCaseForStudentsResponse",
	link: [TeacherCaseStudies, NEXT_JWT_SECRET],
});
api.route("GET /api/case/archived/{caseFilter}", {
	handler: "server/controllers/handleArchivedCases.getArchivedCases",
	link: [
		NEXT_JWT_SECRET,
		TeacherCaseStudies,
		Feedback,
		Users_Table,
		StudentsResponses,
	],
});
api.route("GET /api/case/active", {
	handler: "server/controllers/handlePublishedCase.getPublishedCase",
	link: [
		NEXT_JWT_SECRET,
		TeacherCaseStudies,
		Feedback,
		Users_Table,
		StudentsResponses,
	],
});
api.route("POST /api/case/publish", {
	handler: "server/controllers/handlePublishedCase.publishCase",
	link: [NEXT_JWT_SECRET, TeacherCaseStudies],
});
// api.route("POST /api/case/add", {
// 	handler: "server/controllers/case.controller.addCase",
// 	link,
// 	memory: "2048 MB",
// binaryMediaTypes: ["*/*"],
// });

api.route("GET /api/case/draft/{caseId}", {
	handler: "server/controllers/handleDraftCases.getDraftCases",
	link: [NEXT_JWT_SECRET, TeacherCaseStudies],
});

api.route("POST /api/case/draft", {
	handler: "server/controllers/handleDraftCases.addDraftCase",
	link: [TeacherCaseStudies, NEXT_JWT_SECRET],
});
api.route("PUT /api/case/draft/{caseID}", {
	handler: "server/controllers/handleDraftCases.updateDraftCase",
	link: [TeacherCaseStudies, NEXT_JWT_SECRET],
});
// api.route("DELETE /api/case/delete-case/{caseID}", {
// 	handler: "server/controllers/handleDraftCases.deleteDraftCase",
// 	link: [
// 		Users_Table,

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

// api.route("POST /api/case/duplicate", {
// 	handler: "server/controllers/case.controller.duplicateCase",
// 	link: [
// 		Users_Table,

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

api.route("POST /api/case/add/feedback", {
	handler: "server/controllers/case.controller.addFeedback",
	link: [NEXT_JWT_SECRET, Feedback],
});
api.route("GET /api/case/feedbacks/{caseID}", {
	handler: "server/controllers/case.controller.getCaseFeedback",
	link: [NEXT_JWT_SECRET, Feedback],
});
api.route("GET /api/case/responses/{caseID}", {
	handler: "server/controllers/case.controller.getCaseAnswers",
	link: [Users_Table, StudentsResponses],
});
// api.route("GET /api/case/data/{caseID}", {
// 	handler: "server/controllers/case.controller.getCaseData",
// 	link: [
// 		Users_Table,

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
// api.route("GET /api/case/student/attempts/{studentID}", {
// 	handler: "server/controllers/case.controller.getCaseAttemptsByStudent",
// 	link: [
// 		Users_Table,

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

// api.route("DELETE /api/case/delete/all/", {
//   handler: "handler.handler",
//   link,
// });

// Quiz
api.route("POST /api/quiz/submit", {
	handler: "server/controllers/quiz.controller.submitStudentsAnswers",
	link: [StudentsResponses, NEXT_JWT_SECRET, TeacherCaseStudies],
});
api.route("GET /api/quiz/answers/{caseID}", {
	handler: "server/controllers/quiz.controller.getStudentsAnswers",
	link: [StudentsResponses],
});
// api.route("POST /api/quiz/generate-certificate", {
// 	handler: "server/controllers/student.controller.generatePassingCertificate",
// 	link: [
// 		Users_Table,

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

// Student
// api.route("GET /api/student/certificates", {
// 	handler: "server/controllers/student.controller.getStudentCertificates",
// 	link: [
// 		Users_Table,

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
// api.route("GET /api/student/certificate/{caseID}", {
// 	handler: "server/controllers/student.controller.getCertificateByCaseID",
// 	link: [
// 		Users_Table,

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
api.route("GET /api/student/get-responses/{caseFilter}", {
	handler: "server/controllers/student.controller.getStudentsResponses",
	link: [StudentsResponses, NEXT_JWT_SECRET],
});
