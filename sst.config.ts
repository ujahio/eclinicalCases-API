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
		const { JwtSecret, PassSecret } = await import("./infra/secrets");

		const NextPublicBaseUrl = new sst.Secret(
			"NextPublicBaseUrl",
			process.env.NextPublicBaseUrl
		);
		const NextNodeEnv = new sst.Secret("NextNodeEnv", process.env.NextNodeEnv);

		const NextPassSecretKey = new sst.Secret(
			"NextPassSecretKey",
			process.env.NextPassSecretKey
		);

		const secrets = [
			JwtSecret,
			PassSecret,
			NextPublicBaseUrl,
			NextNodeEnv,
			NextPassSecretKey,
		];
		// NextApp
		new sst.aws.Nextjs("MyWeb", {
			link: secrets,
		});
		// Bucket
		await import("./infra/storage");
		// API
		await import("./infra/api");
		// Tables
		await import("./infra/dynamo");
	},
});
