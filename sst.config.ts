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
		// Bucket
		await import("./infra/client");
		// Bucket
		await import("./infra/storage")  
		// API
		await import("./infra/api");
		// Tables
		await import("./infra/dynamo");
	},
});
