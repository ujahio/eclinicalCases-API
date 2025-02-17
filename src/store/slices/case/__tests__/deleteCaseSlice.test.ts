import { makeStore } from "@/store/store";
import { deleteCase } from "../deleteCaseSlice";
import { deleteCaseApi } from "@/services/apis/case";

jest.mock("@/services/apis/case", () => ({
	deleteCaseApi: jest.fn(),
}));

describe("deleteCaseSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().deleteCase).toEqual({
			status: "idle",
			error: null,
			deletedCaseId: null,
		});
	});

	it("should handle successful case deletion", async () => {
		const deletedCaseId = "123";
		(deleteCaseApi as jest.Mock).mockResolvedValue({ data: deletedCaseId });

		await store.dispatch(deleteCase(deletedCaseId));

		expect(store.getState().deleteCase.status).toBe("succeeded");
		expect(store.getState().deleteCase.deletedCaseId).toBe(deletedCaseId);
	});

	it("should handle API error", async () => {
		const error = { response: { data: "Failed to delete case" } };
		(deleteCaseApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(deleteCase("123"));

		expect(store.getState().deleteCase.status).toBe("failed");
		expect(store.getState().deleteCase.error).toBe("Failed to delete case");
	});
});
