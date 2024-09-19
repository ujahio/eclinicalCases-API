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
		const STAGE = $app.stage;
		const domainName =
			STAGE === "production" ? "eccs-online.com" : `${STAGE}.eccs-online.com`;

		const {
			NEXT_JWT_SECRET,
			NEXT_PASS_SECRET,
			NEXT_PUBLIC_BASE_URL,
			NEXT_NODE_ENV,
			NEXT_PASS_SECRET_KEY,
		} = await import("./infra/secrets");

		const secrets = [
			NEXT_JWT_SECRET,
			NEXT_PASS_SECRET,
			NEXT_PUBLIC_BASE_URL,
			NEXT_NODE_ENV,
			NEXT_PASS_SECRET_KEY,
		];

		// NextApp
		new sst.aws.Nextjs("MyWeb", {
			link: secrets,
			domain: {
				name: domainName,
			},
		});

		// Bucket
		await import("./infra/storage");
		// API
		await import("./infra/api");
		// Tables
		await import("./infra/dynamo");
	},
});
