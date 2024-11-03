/// <reference path="../.sst/platform/config.d.ts" />

import { client } from "./client";

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
					emailMessageByLink: "Message goes here {##Click Here##}",
				},
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

export const eccsWebClient = userPool.addClient("eccswebclient", {
	transform: {
		client: {
			allowedOauthFlows: ["code"],
			refreshTokenValidity: 1,
			generateSecret: true,
			callbackUrls: [
				$interpolate`https://${process.env.NEXT_PUBLIC_DOMAIN}/api/auth/callback/cognito`,
				"http://localhost:3000/api/auth/callback/cognito",
			],
			logoutUrls: [
				$interpolate`https://${process.env.NEXT_PUBLIC_DOMAIN}`,
				"http://localhost:3000",
			],
			supportedIdentityProviders: ["COGNITO"],
		},
	},
});
