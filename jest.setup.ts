import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
		};
	},
	useSearchParams() {
		return {
			get: jest.fn(),
		};
	},
}));

// Mock next-auth with proper ESM structure
jest.mock("next-auth/react", () => ({
	__esModule: true,
	signIn: jest.fn(),
	signOut: jest.fn(),
	useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
	getSession: jest.fn(),
}));

jest.mock("next-auth", () => ({
	__esModule: true,
	default: jest.fn(),
	getServerSession: jest.fn(),
}));
