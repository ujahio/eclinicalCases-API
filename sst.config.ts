/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "eccs-labs",
			removal: input?.stage === "production" ? "retain" : "remove",
			home: "aws",
		};
	},
	async run() {
		// Bucket
		await import("./infra/client");
		// Bucket
		await import("./infra/storage");
		// Tables
		await import("./infra/dynamo");
		// Auth
		await import("./infra/auth");
		// Payment (must be before api — api imports Payments table)
		await import("./infra/payment");
		// API
		await import("./infra/api");
		// Archived Cases Cron
		await import("./infra/archive-case-status");
	},
});
