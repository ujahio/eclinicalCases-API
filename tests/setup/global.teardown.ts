// Generated from specs/student-registration-test-plan.md — global teardown
import { FullConfig } from "@playwright/test";
import { cleanupTestUsers } from "../helpers/cleanup";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Cleaning up test users...");
  await cleanupTestUsers("e2e-");
  console.log("✅ Cleanup complete");
}

export default globalTeardown;
