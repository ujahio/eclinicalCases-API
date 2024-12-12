/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "eccs-labs",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
			providers: {
				aws: {
					region: "me-south-1",
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
		const auth = await import("./infra/auth");
		// Archived Cases Cron
		await import("./infra/archive-case-status");
	},
});
