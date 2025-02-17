import { makeStore } from "@/store/store";
import { getDraftCases, resetGetDraftCasesStatus } from "../getDraftCasesSlice";
import { getDraftCasesApi } from "@/services/apis/case";

jest.mock("@/services/apis/case", () => ({
	getDraftCasesApi: jest.fn(),
}));

describe("getDraftCasesSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().getDraftCases).toEqual({
			status: "idle",
			error: null,
			cases: [],
		});
	});

	it("should handle reset getDraftCases state", () => {
		store.dispatch(resetGetDraftCasesStatus());
		expect(store.getState().getDraftCases.status).toBe("idle");
		expect(store.getState().getDraftCases.error).toBe(null);
	});

	it("should handle successful getting of draft cases", async () => {
		const draftCasesResponse = {
			draftCasesInfo: [{ id: 1, title: "Test Case" }],
		};
		(getDraftCasesApi as jest.Mock).mockResolvedValueOnce({
			data: draftCasesResponse,
		});

		await store.dispatch(getDraftCases(1));

		expect(store.getState().getDraftCases.status).toBe("succeeded");
		expect(store.getState().getDraftCases.cases).toEqual(
			draftCasesResponse.draftCasesInfo
		);
		expect(store.getState().getDraftCases.error).toBe(null);
	});

	it("should handle failure for getting draft cases", async () => {
		const error = {
			response: {
				status: 404,
				data: "Not found",
			},
		};
		(getDraftCasesApi as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(getDraftCases(1));

		expect(store.getState().getDraftCases.status).toBe("failed");
		expect(store.getState().getDraftCases.error).toEqual({
			status: 404,
			message: "Not found",
		});
	});
});
