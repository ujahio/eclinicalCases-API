#!/usr/bin/env bun
import { Resource } from "sst";
import { execSync } from "child_process";

const resourceStage = Resource.App.stage;
console.log(`Resource.App.stage: ${resourceStage}`);

const args = process.argv.slice(2);
const stageArgIndex = args.findIndex(a => a.startsWith("--stage"));
const stageArg = stageArgIndex !== -1
  ? args[stageArgIndex].includes("=")
    ? args[stageArgIndex].split("=")[1]
    : args[stageArgIndex + 1]
  : undefined;

const stage = stageArg || resourceStage;

if (!stage) {
  console.log("No environment provided. Running SST remove without stage.");
  execSync("bunx sst remove", { stdio: "inherit" });
} else {
  console.log(`Environment: ${stage}`);
  console.log(`Running SST remove with stage '${stage}'...`);
  execSync(`bunx sst remove --stage ${stage}`, { stdio: "inherit" });
}
