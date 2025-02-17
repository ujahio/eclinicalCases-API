import { makeStore } from "@/store/store";
import {
	getStudentsCertificates,
	resetStudentsCertificatesStatus,
} from "../getStudentsCertificatesSlice";
import { getStudentsCertificatesApi } from "@/services/apis/student";

// Mock the API
jest.mock("@/services/apis/student", () => ({
	getStudentsCertificatesApi: jest.fn(),
}));

describe("getStudentsCertificatesSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().studentsCertificates).toEqual({
			status: "idle",
			error: null,
			data: [],
		});
	});

	it("should handle resetStudentsCertificatesStatus", () => {
		store.dispatch(resetStudentsCertificatesStatus());
		expect(store.getState().studentsCertificates.status).toBe("idle");
		expect(store.getState().studentsCertificates.error).toBe(null);
	});

	it("should handle successful retrieval of students certificates", async () => {
		const getStudentsCertificatesResponse = {
			processedCertificates: [{ id: 1, name: "Test Certificate" }],
		};
		(getStudentsCertificatesApi as jest.Mock).mockResolvedValueOnce({
			data: getStudentsCertificatesResponse,
		});

		await store.dispatch(getStudentsCertificates());

		expect(store.getState().studentsCertificates.status).toBe("succeeded");
		expect(store.getState().studentsCertificates.data).toEqual(
			getStudentsCertificatesResponse.processedCertificates
		);
		expect(store.getState().studentsCertificates.error).toBe(null);
	});

	it("should handle failed retrieval of students certificates", async () => {
		const error = {
			response: {
				status: 500,
				data: "Server error",
			},
		};
		(getStudentsCertificatesApi as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(getStudentsCertificates());

		expect(store.getState().studentsCertificates.status).toBe("failed");
		expect(store.getState().studentsCertificates.error).toEqual({
			status: 500,
			message: "Server error",
		});
	});
});
