import {
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
	NEXT_PUBLIC_DOMAIN,
} from "./secrets";
import { authUrl, userPool, eccsWebClient } from "./auth";

const STAGE = $app.stage;
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN;

const domainName = STAGE === "production" ? DOMAIN : `${STAGE}.${DOMAIN}`;

export const client = new sst.aws.Nextjs("eccslabsClient", {
	link: [
		NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_NODE_ENV,
		NEXT_PUBLIC_PASS_SECRET_KEY,
		userPool,
		eccsWebClient,
	],
	domain: {
		name: domainName,
	},
	environment: {
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		NEXT_PUBLIC_REGION: aws.getRegionOutput().name,
		NEXT_PUBLIC_USER_POOL_DOMAIN: authUrl,
	},
});
