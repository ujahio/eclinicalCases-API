import { makeStore } from "@/store/store";
import { addFeedbackApi } from "@/services/apis/student";
import {
	addFeedback,
	resetAddFeedbackStatus,
	resetAddFeedbackState,
} from "../addFeedbackSlice";

jest.mock("@/services/apis/student", () => ({
	addFeedbackApi: jest.fn(),
}));

describe("addFeedbackSlice", () => {
	let store: ReturnType<typeof makeStore>;

	beforeEach(() => {
		store = makeStore();
		jest.clearAllMocks();
	});

	it("should handle initial state", () => {
		expect(store.getState().addFeedback).toEqual({
			status: "idle",
			error: null,
			feedback: null,
			hasSubmittedFeedback: false,
		});
	});

	it("should handle resetAddFeedbackStatus", () => {
		store.dispatch(resetAddFeedbackStatus());

		expect(store.getState().addFeedback.status).toBe("idle");
		expect(store.getState().addFeedback.error).toBe(null);
		expect(store.getState().addFeedback.hasSubmittedFeedback).toBe(false);
	});

	it("should handle resetAddFeedbackState", () => {
		store.dispatch(resetAddFeedbackState());

		expect(store.getState().addFeedback).toEqual({
			status: "idle",
			error: null,
			feedback: null,
			hasSubmittedFeedback: false,
		});
	});

	it("should handle successful adding of feedback", async () => {
		const feedbackResponse = {
			rating: 5,
			comment: "Great case!",
		};
		const mockResponse = {
			id: 1,
			...feedbackResponse,
		};

		(addFeedbackApi as jest.Mock).mockResolvedValueOnce({
			data: mockResponse,
		});

		await store.dispatch(addFeedback(feedbackResponse));

		expect(store.getState().addFeedback.status).toBe("succeeded");
		expect(store.getState().addFeedback.feedback).toEqual(mockResponse);
		expect(store.getState().addFeedback.hasSubmittedFeedback).toBe(true);
		expect(store.getState().addFeedback.error).toBe(null);
	});

	it("should handle failed request to add feedback", async () => {
		const feedbackResponse = {
			rating: 5,
			comment: "Great case!",
		};
		const error = {
			response: {
				status: 400,
				data: "Invalid feedback data",
			},
		};

		(addFeedbackApi as jest.Mock).mockRejectedValueOnce(error);

		await store.dispatch(addFeedback(feedbackResponse));

		expect(store.getState().addFeedback.status).toBe("failed");
		expect(store.getState().addFeedback.error).toEqual({
			status: 400,
			message: "Invalid feedback data",
		});
		expect(store.getState().addFeedback.hasSubmittedFeedback).toBe(false);
	});
});
