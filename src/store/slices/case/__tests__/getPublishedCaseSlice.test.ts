import { getPublishedCase } from "../getPublishedCaseSlice";
import { fetchPublishedCaseApi } from "@/services/apis/case";
import { makeStore } from "@/store/store";

jest.mock("@/services/apis/case", () => ({
	fetchPublishedCaseApi: jest.fn(),
}));

describe("getPublishedCaseSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().activeCase).toEqual({
			status: "idle",
			error: null,
			data: null,
		});
	});

	it("should handle successful publishedcase fetch", async () => {
		const mockCase = {
			caseInfo: {
				id: "1",
				title: "Published Case",
			},
		};
		(fetchPublishedCaseApi as jest.Mock).mockResolvedValue({ data: mockCase });

		await store.dispatch(getPublishedCase());

		expect(store.getState().activeCase.status).toBe("succeeded");
		expect(store.getState().activeCase.data).toEqual(mockCase.caseInfo);
	});

	it("should handle API error for fetching published case", async () => {
		const error = {
			response: {
				data: "Failed to fetch case",
			},
		};
		(fetchPublishedCaseApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(getPublishedCase());

		expect(store.getState().activeCase.status).toBe("failed");
		expect(store.getState().activeCase.error).toBe("Failed to fetch case");
	});
});
