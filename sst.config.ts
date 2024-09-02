/// <reference path="./.sst/platform/config.d.ts" />
// import { Api, NextjsSite, StackContext } from "@serverless-stack/resources";

export default $config({
  app(input) {
    return {
      name: "e-clinical-js",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("MyWeb");

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
      handler: "handler.handler",
    });
    api.route("GET /api/case/all", {
      handler: "handler.handler",
    });
  },
});
