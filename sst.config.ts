/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "e-clinical-js",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
		};
	},
	async run() {
		// const { JWT_SECRET, PASS_SECRET } = await import("./infra/secrets");
		// const NEXT_PUBLIC_BASE_URL = new sst.Secret("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);
		// const NEXT_NODE_ENV = new sst.Secret("NEXT_NODE_ENV", process.env.NEXT_NODE_ENV);
		// const NEXT_PASS_SECRET_KEY = new sst.Secret("NEXT_PASS_SECRET_KEY", process.env.NEXT_PASS_SECRET_KEY);
		// const secrets = [JWT_SECRET, PASS_SECRET, NEXT_PUBLIC_BASE_URL, NEXT_NODE_ENV, NEXT_PASS_SECRET_KEY];
		// NextApp
		new sst.aws.Nextjs("MyWeb", {
			// link: secrets,
		});
		// Bucket
		await import("./infra/storage");
		// API
		await import("./infra/api");
		// Tables
		await import("./infra/dynamo");
	},
});
