import {
	NEXT_JWT_SECRET,
	NEXT_PUBLIC_PASS_SECRET_KEY,
	NEXT_PUBLIC_BASE_URL,
	NEXT_PUBLIC_NODE_ENV,
} from "./secrets";

const STAGE = $app.stage;
const domainName =
	STAGE === "production" ? "eccs-online.com" : `${STAGE}.eccs-online.com`;

export const client = new sst.aws.Nextjs("eccslabsClient", {
	link: [
		NEXT_JWT_SECRET,
		NEXT_PUBLIC_BASE_URL,
		NEXT_PUBLIC_NODE_ENV,
		NEXT_PUBLIC_PASS_SECRET_KEY,
	],
	domain: {
		name: domainName,
	},
});
