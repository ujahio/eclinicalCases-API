import { makeStore } from "@/store/store";
import { fetchCaseData } from "../getCaseDataSlice";
import { fetchCaseDataApi } from "@/services/apis/case";

jest.mock("@/services/apis/case", () => ({
	fetchCaseDataApi: jest.fn(),
}));

describe("getCaseDataSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().getCaseData).toEqual({
			status: "idle",
			error: null,
			caseData: {
				caseInfo: {},
				responsesAndFeedbackInfo: [],
			},
		});
	});

	it("should handle successful publised case data fetch", async () => {
		const publishedCaseResponse = {
			caseInfo: { id: "1", title: "Test Case" },
		};
		(fetchCaseDataApi as jest.Mock).mockResolvedValue({
			data: publishedCaseResponse,
		});

		await store.dispatch(fetchCaseData("1"));

		expect(store.getState().getCaseData.status).toBe("succeeded");
		expect(store.getState().getCaseData.caseData.caseInfo).toEqual(
			publishedCaseResponse.caseInfo
		);
	});

	it("should handle successful responses and feedback fetch", async () => {
		const responsesAndFeedbackResponse = {
			responseItems: [{ id: "1", response: "Test Response" }],
		};
		(fetchCaseDataApi as jest.Mock).mockResolvedValue({
			data: responsesAndFeedbackResponse,
		});

		await store.dispatch(fetchCaseData("1"));

		expect(store.getState().getCaseData.status).toBe("succeeded");

		expect(
			store.getState().getCaseData.caseData.responsesAndFeedbackInfo
		).toEqual(responsesAndFeedbackResponse.responseItems);
	});

	it("should handle API error", async () => {
		const error = { response: { data: "Failed to fetch case data" } };
		(fetchCaseDataApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(fetchCaseData("1"));

		expect(store.getState().getCaseData.status).toBe("failed");
		expect(store.getState().getCaseData.error).toBe(
			"Failed to fetch case data"
		);
	});
});
