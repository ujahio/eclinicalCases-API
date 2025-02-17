import { makeStore } from "@/store/store";
import { getArchiveCases } from "../getArchiveCasesSlice";
import { getArchiveCasesApi } from "@/services/apis/case";

jest.mock("@/services/apis/case", () => ({
	getArchiveCasesApi: jest.fn(),
}));

describe("getArchiveCasesSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().getArchiveCases).toEqual({
			status: "idle",
			error: null,
			cases: [],
		});
	});

	it("should handle successful archive cases fetch", async () => {
		const archivedCasesResponse = {
			archivedCasesInfo: [
				{ id: "1", title: "Case 1" },
				{ id: "2", title: "Case 2" },
			],
		};
		(getArchiveCasesApi as jest.Mock).mockResolvedValue({
			data: archivedCasesResponse,
		});

		await store.dispatch(getArchiveCases(true));

		expect(store.getState().getArchiveCases.status).toBe("succeeded");
		expect(store.getState().getArchiveCases.cases).toEqual(
			archivedCasesResponse.archivedCasesInfo
		);
	});

	it("should handle API error", async () => {
		const error = {
			response: {
				status: 500,
				data: "Server error",
			},
		};
		(getArchiveCasesApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(getArchiveCases(true));

		expect(store.getState().getArchiveCases.status).toBe("failed");
		expect(store.getState().getArchiveCases.error).toEqual({
			status: 500,
			message: "Server error",
		});
	});
});
