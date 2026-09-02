#!/usr/bin/env bun
import { Resource } from "sst";
import { execSync } from "child_process";

const resourceStage = Resource.App.stage;
console.log(`Resource.App.stage: ${resourceStage}`);

const args = process.argv.slice(2);
const project = args.find((a) => !a.startsWith("--")) || "";
const stageArgIndex = args.findIndex((a) => a.startsWith("--stage"));
const stageArg =
	stageArgIndex !== -1
		? args[stageArgIndex].includes("=")
			? args[stageArgIndex].split("=")[1]
			: args[stageArgIndex + 1]
		: undefined;
const isLocal = args.includes("--local");

const stage = stageArg || resourceStage || "test-e2e";
const projectFlag = project ? `--project=${project}` : "";

if (isLocal) {
	console.log(
		`Running Playwright${project ? ` project '${project}'` : ""} inside SST shell against local sst dev...`,
	);
	console.log("Make sure 'sst dev' is already running in another terminal.");

	const localPort = process.env.PORT || "3000";
	const baseUrl =
		process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${localPort}`;

	console.log(`Using stage: ${stage}`);
	execSync(
		`PLAYWRIGHT_BASE_URL=${baseUrl} bunx playwright test ${projectFlag}`,
		{ stdio: "inherit", env: { ...process.env, PLAYWRIGHT_BASE_URL: baseUrl } },
	);
} else {
	console.log(
		`Running Playwright${project ? ` project '${project}'` : ""} inside SST shell for stage '${stage}'...`,
	);
	execSync(`bunx playwright test ${projectFlag}`, { stdio: "inherit" });
}
