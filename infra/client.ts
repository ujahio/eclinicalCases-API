import { authUrl, userPool, eccsWebClient } from "./auth";

const STAGE = $app.stage;
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN!;

const domainName = STAGE === "production" ? DOMAIN : `${STAGE}.${DOMAIN}`;

export const client = new sst.aws.Nextjs("eccslabsClient", {
	link: [userPool, eccsWebClient],
	domain: {
		name: domainName,
	},
	environment: {
		NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV!,
		NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
		NEXT_PUBLIC_USER_POOL_DOMAIN: authUrl,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
	},
	openNextVersion: "4.0.2",
});
