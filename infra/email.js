const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;
const REGION = $app.region;
const AWS_ACCOUNT_NUMBER = $app.account;

export const email = new sst.aws.Email("MyEmail", {
	domain: DOMAIN,
	sender: DOMAIN,
	mailFromDomain: `no-reply@${DOMAIN}`,
	transform: {
		policy: (args) => {
			// use $jsonParse and $jsonStringify helper functions to manipulate JSON strings
			// containing Output values from components
			args.policy = $jsonParse(args.policy).apply((policy) => {
				policy.Statement.push({
					Effect: "Allow",
					Principal: { Service: "ses.amazonaws.com" },
					Action: "ses:SendEmail",
					Resource: `arn:aws:ses:${REGION}:${AWS_ACCOUNT_NUMBER}:identity/${DOMAIN}`,
				});
				return $jsonStringify(policy);
			});
		},
	},
});
