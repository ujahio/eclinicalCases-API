import { ECCSEmail } from "./email";
import { CaseMaterials, ECCSUsersCertificates } from "./storage";
import {
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
} from "./secrets";
import { userPool, eccsWebClient } from "./auth";

import { Feedback, StudentsResponses, TeacherCaseStudies } from "./dynamo";

const links = [
	Feedback,
	StudentsResponses,
	TeacherCaseStudies,
	CaseMaterials,
	ECCSUsersCertificates,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
	ECCSEmail,
	userPool,
	eccsWebClient,
];

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const STAGE = $app.stage;
const domainName =
	STAGE === "production" ? `api.${DOMAIN}` : `${STAGE}-api.${DOMAIN}`;

export const api = new sst.aws.ApiGatewayV2("eccs", {
	domain: domainName,
	cors: true,
	link: links,
});

const cognitoAuthorizer = api.addAuthorizer({
	name: "Cognito",
	jwt: {
		audiences: [eccsWebClient.id],
		issuer: $interpolate`https://cognito-idp.${
			aws.getArnOutput(userPool).region
		}.amazonaws.com/${userPool.id}`,
	},
});

const jwtAuthorizer = {
	jwt: {
		authorizer: cognitoAuthorizer.id,
	},
};

const routeArgs = {
	auth: jwtAuthorizer,
};

// Auth

api.route("POST /api/auth/signup", "server/controllers/auth.controller.signup");
api.route("POST /api/auth/signin", "server/controllers/auth.controller.signin");
// api.route("POST /api/auth/send-otp", {
// 	handler: "server/controllers/auth.controller.sendOTP",
// 	link: links,
// });
api.route(
	"POST /api/auth/reset-password",
	"server/controllers/auth.controller.verifyOtpAndResetPassword"
);
api.route(
	"POST /api/auth/update-password",
	"server/controllers/auth.controller.updatePassword"
);

//Case;
api.route(
	"GET /api/case/data/{caseID}",
	"server/controllers/case.controller.getCaseData",
	routeArgs
);
api.route(
	"GET /api/case/details/{caseID}",
	"server/controllers/case.controller.getCaseForStudentsResponse",
	routeArgs
);
api.route(
	"GET /api/case/archived/{caseFilter}",
	"server/controllers/handleArchivedCases.getArchivedCases",
	routeArgs
);
api.route(
	"GET /api/case/publish",
	"server/controllers/handlePublishedCase.getPublishedCase",
	routeArgs
);
api.route(
	"POST /api/case/publish",
	"server/controllers/handlePublishedCase.publishCase",
	routeArgs
);
api.route(
	"GET /api/case/draft/{caseId}",
	"server/controllers/handleDraftCases.getDraftCases",
	routeArgs
);

api.route(
	"POST /api/case/draft",
	"server/controllers/handleDraftCases.addDraftCase",
	routeArgs
);
api.route(
	"PUT /api/case/draft/{caseID}",
	"server/controllers/handleDraftCases.updateDraftCase",
	routeArgs
);
api.route(
	"DELETE /api/case/delete-case/{caseID}",
	"server/controllers/handleDraftCases.deleteDraftCase",
	routeArgs
);

// NOT CURRENTLY USED BUT MAYBE USED SO KEEP
// api.route("POST /api/case/duplicate", {
// 	handler: "server/controllers/case.controller.duplicateCase",
// 	link: links,
// });

// Case Materials
api.route(
	"GET /api/case/get-signed-url-for-pdf-upload",
	"server/controllers/handleCaseMaterials.getSignedUrlToUploadForCaseMaterials",
	routeArgs
);

api.route(
	"POST /api/case/get-signed-url-for-pdf-fetch",
	"server/controllers/handleCaseMaterials.getSignedUrlsToFetchForCaseMaterials",
	routeArgs
);

api.route(
	"DELETE /api/case/delete-case-material",
	"server/controllers/handleCaseMaterials.deleteCaseMaterial",
	routeArgs
);

// Student;
api.route(
	"POST /api/case/add/feedback",
	"server/controllers/case.controller.addFeedback",
	routeArgs
);

api.route(
	"GET /api/student/certificates",
	"server/controllers/handleStudentsCertificates.getStudentCertificates",
	routeArgs
);
api.route(
	"GET /api/student/responses/{caseFilter}",
	"server/controllers/handleStudentsResponse.getStudentsResponses",
	routeArgs
);

// AUTHORIZATION IS IN THE LAMBDA FUNCTION
api.route("POST /api/student/response", {
	handler: "server/controllers/handleStudentsResponse.submitStudentResponse",
	runtime: "nodejs18.x",
	copyFiles: [
		{
			from: "./server/assets/images/logo.png",
			to: "assets/images/logo.png",
		},
	],
	link: links,
});
