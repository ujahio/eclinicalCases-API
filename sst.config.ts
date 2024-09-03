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
		new sst.aws.Nextjs("MyWeb", {
			// Next.js build output
			domain: {
				name: domainName,
			},
		});

		// API
		const api = new sst.aws.ApiGatewayV2("MyApi");
		api.route("POST /api/auth/signin", {
			handler: "handler.handler",
		});
		api.route("POST /api/auth/signup", {
			handler: "handler.handler",
		});
		api.route("POST /api/auth/send-otp", {
			handler: "handler.handler",
		});
		api.route("POST /api/auth/reset-password", {
			handler: "handler.handler",
		});
		api.route("POST /api/auth/update-password", {
			handler: "handler.handler",
		});
		api.route("GET /api/auth/users", {
			handler: "server/conrollers/auth.controller.getUsers",
		});
		api.route("GET /api/case/all", {
			handler: "handler.handler",
		});
	},
});
