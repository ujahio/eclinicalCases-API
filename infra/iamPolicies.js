const REGION = $app.region;
const AWS_ACCOUNT_NUMBER = $app.account;
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

// Create a permission boundary
// export const permissionsBoundary = new aws.iam.Policy("ses_send_email_policy", {
// 	policy: aws.iam.getPolicyDocumentOutput({
// 		statements: [
// 			{
// 				actions: ["ses:SendEmail"],
// 				resources: [
// 					`arn:aws:ses:${REGION}:${AWS_ACCOUNT_NUMBER}:identity/no-reply@${DOMAIN}`,
// 				],
// 			},
// 		],
// 	}).json,
// });

export const permissionsBoundary = sst.aws.policy({
	policy: {
		Statement: [
			{
				Effect: "Allow",
				Action: "ses:SendEmail",
				Resource: `arn:aws:ses:${REGION}:${AWS_ACCOUNT_NUMBER}:identity/no-reply@${DOMAIN}`,
			},
		],
	},
});
