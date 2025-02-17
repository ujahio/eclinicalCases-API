import { makeStore } from "@/store";
import { getStudentsResponsesApi } from "@/services/apis/student";
import {
	getStudentsResponsesToCases,
	resetGetStudentsResponsesToCasesStatus,
} from "../getStudentsResponsesToCasesSlice";

jest.mock("@/services/apis/student", () => ({
	getStudentsResponsesApi: jest.fn(),
}));

describe("getStudentsResponsesToCasesSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
	});

	it("should handle initial state", () => {
		expect(store.getState().studentsResponsesToCases).toEqual({
			status: "idle",
			error: null,
			responses: [],
		});
	});

	it("should handle resetGetStudentsResponsesToCasesStatus", () => {
		store.dispatch(resetGetStudentsResponsesToCasesStatus());
		expect(store.getState().studentsResponsesToCases).toEqual({
			status: "idle",
			error: null,
			responses: [],
		});
	});

	it("should handle successful getStudentsResponsesToCases", async () => {
		const mockData = {
			data: [{ id: 1, response: "Test Response" }],
		};
		(getStudentsResponsesApi as jest.Mock).mockResolvedValueOnce({
			data: mockData,
		});

		await store.dispatch(getStudentsResponsesToCases(true));

		expect(store.getState().studentsResponsesToCases.status).toBe("succeeded");
		expect(store.getState().studentsResponsesToCases.responses).toEqual(
			mockData.data
		);
		expect(store.getState().studentsResponsesToCases.error).toBe(null);
	});

	it("should handle failed getStudentsResponsesToCases", async () => {
		const error = {
			response: {
				data: "Error fetching responses",
			},
		};
		(getStudentsResponsesApi as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(getStudentsResponsesToCases(true));

		expect(store.getState().studentsResponsesToCases.status).toBe("failed");
		expect(store.getState().studentsResponsesToCases.error).toBe(
			error.response.data
		);
	});
});
