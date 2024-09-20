import {
	NEXT_JWT_SECRET,
	NEXT_PASS_SECRET,
	NEXT_PUBLIC_BASE_URL,
	NEXT_NODE_ENV,
	NEXT_PASS_SECRET_KEY,
} from "./secrets";

const STAGE = $app.stage;
const domainName =
	STAGE === "production" ? "eccs-online.com" : `${STAGE}.eccs-online.com`;

export const client = new sst.aws.Nextjs("MyWeb", {
	link: [
		NEXT_JWT_SECRET,
		NEXT_PASS_SECRET,
		NEXT_PUBLIC_BASE_URL,
		NEXT_NODE_ENV,
		NEXT_PASS_SECRET_KEY,
	],
	domain: {
		name: domainName,
	},
});
