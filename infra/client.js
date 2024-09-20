const STAGE = $app.stage;
const domainName =
	STAGE === "production" ? "eccs-online.com" : `${STAGE}.eccs-online.com`;

const {
	NEXT_JWT_SECRET,
	NEXT_PASS_SECRET,
	NEXT_PUBLIC_BASE_URL,
	NEXT_NODE_ENV,
	NEXT_PASS_SECRET_KEY,
} = await import("./secrets");

const secrets = [
	NEXT_JWT_SECRET,
	NEXT_PASS_SECRET,
	NEXT_PUBLIC_BASE_URL,
	NEXT_NODE_ENV,
	NEXT_PASS_SECRET_KEY,
];

// NextApp
export const client = new sst.aws.Nextjs("MyWeb", {
	link: secrets,
	domain: {
		name: domainName,
	},
});
