import { ECCSEmail } from "./email";
import { CaseMaterials, ECCSUsersCertificates } from "./storage";
import { NEXT_PUBLIC_BASE_URL, NEXT_PUBLIC_NODE_ENV } from "./secrets";
import { userPool, eccsWebClient } from "./auth";
import { Feedback, StudentsResponses, TeacherCaseStudies } from "./dynamo";

const links = [
	Feedback,
	StudentsResponses,
	TeacherCaseStudies,
	CaseMaterials,
	ECCSUsersCertificates,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
	ECCSEmail,
];

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const STAGE = $app.stage;
const domainName =
	STAGE === "production" ? `api.${DOMAIN}` : `${STAGE}-api.${DOMAIN}`;

export const api = new sst.aws.ApiGatewayV2("eccs", {
	domain: domainName,
	cors: true,
	transform: {
		stage: (args) => {
			args.defaultRouteSettings = {
				throttlingBurstLimit: 100,
				throttlingRateLimit: 50,
			};
		},
	},
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

const routeArgs = {
	auth: {
		jwt: {
			authorizer: cognitoAuthorizer.id,
		},
	},
};

// Auth

api.route("POST /api/auth/refresh-token", {
	link: [...links, userPool, eccsWebClient],
	handler: "server/controllers/auth.refreshToken",
});
api.route("POST /api/auth/signin", {
	link: [...links, userPool, eccsWebClient],
	handler: "server/controllers/auth.signin",
});
api.route("POST /api/auth/signup", {
	link: [...links, userPool, eccsWebClient],
	handler: "server/controllers/auth.signup",
});
// api.route("POST /api/auth/send-otp", {
// 	handler: "server/controllers/auth.sendOTP",
// 	link: links,
// });
// api.route("POST /api/auth/reset-password", {
// 	handler: "server/controllers/auth.verifyOtpAndResetPassword",
// 	link: links,
// });
// api.route("POST /api/auth/update-password", {
// 	handler: "server/controllers/auth.updatePassword",
// 	link: links,
// });
api.route(
	"POST /api/auth/destroy-session",
	{
		link: [...links, userPool, eccsWebClient],
		handler: "server/controllers/auth-session.destroySession",
	},
	routeArgs,
);

//Case;
api.route(
	"GET /api/case/data/{caseID}",
	{
		handler: "server/controllers/case.getCaseData",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"GET /api/case/details/{caseID}",
	{
		handler: "server/controllers/case.getCaseForStudentsResponse",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"GET /api/case/archived/{caseFilter}",
	{
		handler: "server/controllers/handleArchivedCases.getArchivedCases",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"GET /api/case/publish",
	{
		handler: "server/controllers/handlePublishedCase.getPublishedCase",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"POST /api/case/publish",
	{
		handler: "server/controllers/handlePublishedCase.publishCase",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"GET /api/case/draft",
	{
		handler: "server/controllers/handleDraftCases.getDraftCases",
		link: [...links, userPool],
	},
	routeArgs,
);

api.route(
	"POST /api/case/draft",
	{
		handler: "server/controllers/handleDraftCases.addDraftCase",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"PUT /api/case/draft/{caseID}",
	{
		handler: "server/controllers/handleDraftCases.updateDraftCase",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"DELETE /api/case/delete-case/{caseID}",
	{
		handler: "server/controllers/handleDraftCases.deleteDraftCase",
		link: [...links, userPool],
	},
	routeArgs,
);

// NOT CURRENTLY USED BUT MAYBE USED SO KEEP
// api.route("POST /api/case/duplicate", {
// 	handler: "server/controllers/case.duplicateCase",
// 	link: links,
// });

// Case Materials
api.route(
	"GET /api/case/get-signed-url-for-pdf-upload",
	{
		handler:
			"server/controllers/handleCaseMaterials.getSignedUrlToUploadForCaseMaterials",
		link: [...links, userPool],
	},
	routeArgs,
);

api.route(
	"POST /api/case/get-signed-url-for-pdf-fetch",
	{
		handler:
			"server/controllers/handleCaseMaterials.getSignedUrlsToFetchForCaseMaterials",
		link: [...links, userPool],
	},
	routeArgs,
);

api.route(
	"DELETE /api/case/delete-case-material",
	{
		handler: "server/controllers/handleCaseMaterials.deleteCaseMaterial",
		link: [...links, userPool],
	},
	routeArgs,
);

// Student;
api.route(
	"POST /api/case/add/feedback",
	{
		handler: "server/controllers/case.addFeedback",
		link: [...links, userPool],
	},
	routeArgs,
);

api.route(
	"GET /api/student/certificates",
	{
		handler:
			"server/controllers/handleStudentsCertificates.getStudentCertificates",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"GET /api/student/responses/{caseFilter}",
	{
		handler: "server/controllers/handleStudentsResponse.getStudentsResponses",
		link: [...links, userPool],
	},
	routeArgs,
);
api.route(
	"POST /api/student/response",
	{
		handler: "server/controllers/handleStudentsResponse.submitStudentResponse",
		copyFiles: [
			{
				from: "src/assets/images/logo.png",
				to: "core/src/assets/images/logo.png",
			},
		],
		link: [...links, userPool],
	},
	routeArgs,
);
