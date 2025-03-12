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
          version: "6.71.0",
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
