import { makeStore } from "@/store/store";
import { signup } from "@/services/apis/auth";
import { signupUser, resetSignupState, resetUserStatus } from "../signupSlice";

// Mock only the specific API
jest.mock("@/services/apis/auth", () => ({
	signup: jest.fn(),
}));

describe("signupSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().signup).toEqual({
			status: "idle",
			error: null,
			user: null,
			date: null,
		});
	});

	it("should handle successful user signup", async () => {
		const mockSignupData = {
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			password: "password123",
			user_role: "student",
			extraField: "should be filtered out",
		};

		const mockSignupResponse = {
			id: 1,
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			user_role: "student",
		};

		(signup as jest.Mock).mockResolvedValueOnce({ data: mockSignupResponse });

		await store.dispatch(signupUser(mockSignupData));

		expect(store.getState().signup.status).toBe("succeeded");
		expect(store.getState().signup.user).toEqual(mockSignupResponse);
		expect(store.getState().signup.error).toBe(null);
		expect(store.getState().signup.date).toBeTruthy();
		expect(
			new Date(store.getState().signup.date!).getTime()
		).toBeLessThanOrEqual(new Date().getTime());
	});

	it("should handle failed signup with response error", async () => {
		const mockSignupData = {
			firstName: "John",
			lastName: "Doe",
			email: "invalid-email",
			password: "password123",
			user_role: "student",
		};

		const error = {
			response: {
				status: 400,
				data: "Invalid email format",
			},
		};

		(signup as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(signupUser(mockSignupData));

		expect(store.getState().signup.status).toBe("failed");
		expect(store.getState().signup.error).toEqual({
			status: 400,
			message: "Invalid email format",
		});
		expect(store.getState().signup.user).toBe(null);
	});

	it("should handle failed signup with network error", async () => {
		const mockSignupData = {
			firstName: "John",
			lastName: "Doe",
			email: "john@example.com",
			password: "password123",
			user_role: "student",
		};

		const error = {
			status: 500,
			message: "Network Error",
		};

		(signup as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(signupUser(mockSignupData));

		expect(store.getState().signup.status).toBe("failed");
		expect(store.getState().signup.error).toEqual({
			status: 500,
			message: "Network Error",
		});
		expect(store.getState().signup.user).toBe(null);
	});

	it("should set loading state while signup is pending", () => {
		(signup as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

		store.dispatch(
			signupUser({
				firstName: "John",
				lastName: "Doe",
				email: "john@example.com",
				password: "password123",
				user_role: "student",
			})
		);

		expect(store.getState().signup.status).toBe("loading");
	});

	it("should handle resetSignupState", () => {
		// Set some initial changes to state
		store.dispatch(resetSignupState());

		expect(store.getState().signup.status).toBe("idle");
		expect(store.getState().signup.error).toBe(null);
		// Should not affect user and date
		expect(store.getState().signup.user).toBe(null);
		expect(store.getState().signup.date).toBe(null);
	});
});
