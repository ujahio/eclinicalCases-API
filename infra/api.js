import { bucket } from "./storage";
import { email } from "./email";
import {
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
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
	email,
	bucket,
];

const STAGE = $app.stage;
const domainName =
	STAGE === "production"
		? "api.eccs-online.com"
		: `${STAGE}-api.eccs-online.com`;

export const api = new sst.aws.ApiGatewayV2("MyApi", {
	domain: domainName,
});

api.route("GET /", {
	handler: "handler.handler",
	link: links,
});

// Auth
api.route("POST /api/auth/signin", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/auth/signup", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/auth/send-otp", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/auth/reset-password", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/auth/update-password", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/auth/users", {
	handler: "handler.handler",
	link: links,
});

// Case
api.route("GET /api/case/details/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/case/all/{caseStatus}", {
	handler: "handler.handler",
	link: links,
	integrations: {
		queryParameters: {
			caseStatus: true,
		},
	},
});
api.route("GET /api/case/ongoing-case", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/case/add", {
	handler: "handler.handler",
	link: links,
	memory: "2048 MB",
	binaryMediaTypes: ["*/*"],
});
api.route("POST /api/case/update/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/case/duplicate", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/case/publish", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/case/add/feedback", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/case/feedbacks/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/case/responses/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/case/data/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/case/student/attempts/{studentID}", {
	handler: "handler.handler",
	link: links,
});
api.route("DELETE /api/case/delete-case/{caseID}", {
	handler: "handler.handler",
	link: links,
});
// api.route("DELETE /api/case/delete/all/", {
//   handler: "handler.handler",
//   link: links,
// });

// Quiz
api.route("POST /api/quiz/submit", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/quiz/answers/{caseID}", {
	handler: "handler.handler",
	link: links,
});

// Student
api.route("GET /api/student/certificates", {
	handler: "handler.handler",
	link: links,
});
api.route("GET /api/student/certificate/{caseID}", {
	handler: "handler.handler",
	link: links,
});
api.route("POST /api/student/new-case-notification", {
	handler: "server/controllers/student.controller.newCaseNotification",
	link: links,
});
