/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		const REGION = (process.env.NEXT_PUBLIC_REGION ||
			"us-east-1") as aws.Region;
		const VERSION = process.env.NEXT_SST_VERSION || "7.20.0";
		return {
			name: "eccs-labs",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
			providers: {
				aws: {
					region: REGION,
					version: VERSION,
				},
			},
		};
	},
	async run() {
		// Bucket
		await import("./infra/client");
		// Bucket
		await import("./infra/storage");
		// API
		await import("./infra/api");
		// Tables
		await import("./infra/dynamo");
		// Auth
		await import("./infra/auth");
		// Archived Cases Cron
		await import("./infra/archive-case-status");
	},
});
