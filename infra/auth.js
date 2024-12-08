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
					emailSubject: `${domainName} - Verify your email`,
					emailSubjectByLink: "Confirm your registration",
					emailMessageByLink: `<!DOCTYPE html>
              <html>
                <head>
                  <style>
                    .body {
                      background-color: #f6f9fc;
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      margin: 0;
                    }
                    .container {
                      background-color: #ffffff;
                      margin: 0 auto;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                      max-width: 600px;
                      width: 100%;
                    }
                    .box {
                      padding: 20px;
                      text-align: center;
                    }
                    .paragraph {
                      color: #555;
                      font-size: 16px;
                      line-height: 24px;
                      text-align: left;
                      margin-bottom: 16px;
                    }
                    .button {
                      background-color: #32deb5;
                      border-radius: 5px;
                      color: #fff;
                      display: inline-block;
                      font-size: 16px;
                      font-weight: bold;
                      text-align: center;
                      text-decoration: none;
                      padding: 12px 24px;
                      margin-top: 16px;
                    }
                    .footer {
                      color: #777;
                      font-size: 12px;
                      text-align: center;
                      margin-top: 32px;
                    }
                  </style>
                </head>
                <body>
                  <div class="body">
                    <div class="container">
                      <div class="box">
                        <p class="paragraph">Thank you for registering with e-Clinical Cases Solutions.</p>
                        <p class="paragraph">Please {##click this link##} to complete your registration and access the latest course contents.</p>
                      </div>
                      <p class="footer">© ${new Date().getFullYear()} e-Clinical Cases Solutions. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>`,
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
