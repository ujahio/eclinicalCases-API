import { addCase } from "../addCaseSlice";
import { makeStore } from "@/store/store";
import { addDraftCaseApi, publishCaseApi } from "@/services/apis/case";

// Mock the API calls
jest.mock("@/services/apis/case", () => ({
	addDraftCaseApi: jest.fn(),
	publishCaseApi: jest.fn(),
}));

describe("addCaseSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().addCase).toEqual({
			status: "idle",
			error: null,
			newCase: null,
		});
	});

	it("should handle successful draft case creation", async () => {
		const mockData = { id: "1", title: "Test Case" };
		(addDraftCaseApi as jest.Mock).mockResolvedValue({ data: mockData });

		await store.dispatch(addCase({ shouldPublish: false }));

		expect(store.getState().addCase.status).toBe("succeeded");
		expect(store.getState().addCase.newCase).toEqual(mockData);
	});

	it("should handle successful case publication", async () => {
		const mockData = { id: "1", title: "Published Case" };
		(publishCaseApi as jest.Mock).mockResolvedValue({ data: mockData });

		await store.dispatch(addCase({ shouldPublish: true }));

		expect(store.getState().addCase.status).toBe("succeeded");
		expect(store.getState().addCase.newCase).toEqual(mockData);
	});

	it("should handle API error", async () => {
		const error = {
			response: {
				status: 400,
				data: "Error message",
			},
		};
		(addDraftCaseApi as jest.Mock).mockRejectedValue(error);

		await store.dispatch(addCase({ shouldPublish: false }));

		expect(store.getState().addCase.status).toBe("failed");
		expect(store.getState().addCase.error).toEqual({
			status: 400,
			message: "Error message",
		});
	});
});
