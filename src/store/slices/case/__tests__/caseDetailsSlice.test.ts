import { makeStore } from "@/store/store";
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
		store.dispatch(resetCaseDetailsStatus());
		expect(store.getState().caseDetails.status).toBe("idle");
		expect(store.getState().caseDetails.error).toBe(null);
	});

	it("should handle resetCaseDetailsState", () => {
		store.dispatch(resetCaseDetailsState());
		expect(store.getState().caseDetails.status).toBe("idle");
		expect(store.getState().caseDetails.error).toBe(null);
		expect(store.getState().caseDetails.data).toBe(null);
	});

	it("should handle successful fetching of case details", async () => {
		const caseDetailsResponse = {
			caseInfo: { id: 1, title: "Test Case" },
		};
		(fetchCaseDetailsApi as jest.Mock).mockResolvedValueOnce({
			data: caseDetailsResponse,
		});

		await store.dispatch(fetchCaseDetails(1));

		expect(store.getState().caseDetails.status).toBe("succeeded");
		expect(store.getState().caseDetails.data).toEqual(
			caseDetailsResponse.caseInfo
		);
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
