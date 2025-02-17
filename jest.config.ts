import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
	dir: "./",
});

const config: Config = {
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "jest-environment-jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
		"\\.(css|less|sass|scss)$": "identity-obj-proxy",
	},
	transformIgnorePatterns: [
		"node_modules/(?!(next-auth|@babel|@next|next|axios)/)",
	],
	transform: {
		"^.+\\.(t|j)sx?$": "@swc/jest",
	},
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
	coverageProvider: "v8",
	collectCoverageFrom: [
		"src/**/*.{js,jsx,ts,tsx}",
		"!src/**/*.d.ts",
		"!src/**/types/*.ts",
		"!src/app/layout.tsx",
		"!src/app/providers.tsx",
	],
} satisfies Config;

export default createJestConfig(config) as any;
