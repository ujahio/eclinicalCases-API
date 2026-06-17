/// <reference types="node" />
import { defineConfig, devices } from "@playwright/test";
import path from "path";

export const STAGE = process.env.PLAYWRIGHT_STAGE || "test-e2e";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: [
		["html", { outputFolder: "playwright-report" }],
		["list"],
		...(process.env.CI ? [["github"]] : []),
	],
	timeout: 60_000,
	expect: { timeout: 15_000 },
	use: {
		baseURL:
			process.env.PLAYWRIGHT_BASE_URL ||
			`https://${STAGE}.${process.env.NEXT_PUBLIC_DOMAIN}`,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	globalSetup: require.resolve("./tests/setup/global.setup.ts"),
	globalTeardown: require.resolve("./tests/setup/global.teardown.ts"),

	projects: [
		{
			name: "registration",
			testMatch: "**/registration/**/*.spec.ts",
		},
	],
});
