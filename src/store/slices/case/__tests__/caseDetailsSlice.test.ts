import { makeStore } from "@/store";
import { fetchCaseDetailsApi } from "@/services/apis/case";
import {
	fetchCaseDetails,
	resetCaseDetailsStatus,
	resetCaseDetailsState,
} from "../caseDetailsSlice";

jest.mock("@/services/apis/case", () => ({
	fetchCaseDetailsApi: jest.fn(),
}));

describe("caseDetailsSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
	});

	it("should handle initial state", () => {
		expect(store.getState().caseDetails).toEqual({
			status: "idle",
			error: null,
			data: null,
		});
	});

	it("should handle resetCaseDetailsStatus", () => {
		// Set some initial state
		store.dispatch(resetCaseDetailsStatus());
		expect(store.getState().caseDetails.status).toBe("idle");
		expect(store.getState().caseDetails.error).toBe(null);
	});

	it("should handle resetCaseDetailsState", () => {
		// Set some initial state
		store.dispatch(resetCaseDetailsState());
		expect(store.getState().caseDetails.status).toBe("idle");
		expect(store.getState().caseDetails.error).toBe(null);
		expect(store.getState().caseDetails.data).toBe(null);
	});

	it("should handle successful fetchCaseDetails", async () => {
		const mockData = {
			caseInfo: { id: 1, title: "Test Case" },
		};
		(fetchCaseDetailsApi as jest.Mock).mockResolvedValueOnce({
			data: mockData,
		});

		await store.dispatch(fetchCaseDetails(1));

		expect(store.getState().caseDetails.status).toBe("succeeded");
		expect(store.getState().caseDetails.data).toEqual(mockData.caseInfo);
		expect(store.getState().caseDetails.error).toBe(null);
	});

	it("should handle failed fetchCaseDetails", async () => {
		const error = {
			response: {
				status: 404,
				data: "Case not found",
			},
		};
		(fetchCaseDetailsApi as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(fetchCaseDetails(1));

		expect(store.getState().caseDetails.status).toBe("failed");
		expect(store.getState().caseDetails.error).toEqual({
			status: 404,
			message: "Case not found",
		});
	});
});
