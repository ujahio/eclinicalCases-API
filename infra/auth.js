/// <reference path="../.sst/platform/config.d.ts" />

import { client } from "./client";

const STAGE = $app.stage;
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
const domainName = STAGE === "production" ? DOMAIN : `${STAGE}.${DOMAIN}`;

export const userPool = new sst.aws.CognitoUserPool(
	"eccslabs",
	{
		transform: {
			userPool: {
				usernameAttributes: ["email"],
				accountRecoverySetting: {
					recoveryMechanisms: [
						{
							name: "verified_email",
							priority: 1,
						},
					],
				},
				autoVerifiedAttributes: ["email"],
				schemas: [
					{
						name: "email",
						attributeDataType: "String",
						required: true,
						mutable: true,
					},
					{
						name: "firstName",
						attributeDataType: "String",
						developerOnlyAttribute: false,
						mutable: true,
						required: false,
					},
					{
						name: "lastName",
						attributeDataType: "String",
						developerOnlyAttribute: false,
						mutable: true,
						required: false,
					},
					{
						name: "user_role",
						attributeDataType: "String",
						developerOnlyAttribute: false,
						mutable: true,
						required: false,
					},
					{
						name: "teacherId",
						attributeDataType: "String",
						developerOnlyAttribute: false,
						mutable: true,
						required: false,
					},
				],
				verificationMessageTemplate: {
					defaultEmailOption: "CONFIRM_WITH_LINK",
					emailMessageByLink: `Thank you for registering with https://${domainName}. Please {##click this link##} to complete your registration and access the latest course contents.`,
				},
				emailVerificationSubject: `${domainName} - Verify your email`,
			},
		},
	},
	{ dependsOn: client }
);

const userPoolDomain = new aws.cognito.UserPoolDomain(
	"eccsuserpooldomain",
	{
		domain: `${$app.name.toLowerCase()}-${$app.stage.toLowerCase()}`, // Amazon Cognito domain
		userPoolId: userPool.id,
	},
	{ dependsOn: [userPool] }
);

export const authUrl = $concat(
	userPoolDomain.domain,
	".auth.",
	aws.getRegionOutput().name,
	".amazoncognito.com"
);

const stagePrefix =
	$app.stage.toLowerCase() === "production"
		? ""
		: `${$app.stage.toLowerCase()}.`;

export const eccsWebClient = userPool.addClient(`${stagePrefix}eccswebclient`, {
	transform: {
		client: {
			explicitAuthFlows: ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"],
			refreshTokenValidity: 1, // Refresh token validity in days
			generateSecret: false, // No client secret needed for programmatic JWT flow
			supportedIdentityProviders: ["COGNITO"],
		},
	},
});
