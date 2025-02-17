import { makeStore } from "@/store/store";
import { updateDraftCase } from "../updateDraftCaseSlice";
import { updateDraftCaseApi } from "@/services/apis/case";
import { toast } from "react-toastify";

jest.mock("@/services/apis/case", () => ({
	updateDraftCaseApi: jest.fn(),
}));

jest.mock("react-toastify", () => ({
	toast: {
		success: jest.fn(),
	},
}));

describe("updateDraftCaseSlice", () => {
	let store = makeStore();

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().updateDraftCase).toEqual({
			status: "idle",
			error: null,
			cases: null,
		});
	});

	it("should handle successful case update", async () => {
		const draftCaseResponse = {
			_id: "123",
			title: "Updated Case",
		};
		const mockResponse = {
			draftCasesInfo: [draftCaseResponse],
		};

		(updateDraftCaseApi as jest.Mock).mockResolvedValue({ data: mockResponse });

		await store.dispatch(updateDraftCase(draftCaseResponse));

		expect(store.getState().updateDraftCase.status).toBe("succeeded");
		expect(store.getState().updateDraftCase.cases).toEqual(
			mockResponse.draftCasesInfo
		);
		expect(toast.success).toHaveBeenCalledWith("Draft case updated");
	});

	it("should handle API error", async () => {
		const error = {
			response: {
				status: 500,
				data: "Failed to update case",
			},
		};
		(updateDraftCaseApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(updateDraftCase({ _id: "123" }));

		expect(store.getState().updateDraftCase.status).toBe("failed");
		expect(store.getState().updateDraftCase.error).toEqual({
			status: 500,
			message: "Failed to update case",
		});
	});
});
