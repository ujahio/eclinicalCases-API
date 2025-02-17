import { changePassword } from "../changePasswordSlice";
import { makeStore } from "@/store/store";
import { changePasswordApi } from "@/services/apis/auth";

jest.mock("@/services/apis/auth", () => ({
	changePasswordApi: jest.fn(),
}));

describe("changePasswordSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().changePassword).toEqual({
			status: "idle",
			error: null,
			passwordResponse: null,
		});
	});

	it("should handle successful password change", async () => {
		const mockResponse = { message: "Password changed successfully" };
		(changePasswordApi as jest.Mock).mockResolvedValue({ data: mockResponse });

		await store.dispatch(
			changePassword({ oldPassword: "123", newPassword: "456" })
		);

		expect(store.getState().changePassword.status).toBe("succeeded");
		expect(store.getState().changePassword.passwordResponse).toEqual(
			mockResponse
		);
	});

	it("should handle API error", async () => {
		const error = {
			response: {
				data: "Invalid password",
			},
		};
		(changePasswordApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(
			changePassword({ oldPassword: "123", newPassword: "456" })
		);

		expect(store.getState().changePassword.status).toBe("failed");
		expect(store.getState().changePassword.error).toBe("Invalid password");
	});
});
