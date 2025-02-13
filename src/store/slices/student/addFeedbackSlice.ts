import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addFeedbackApi } from "@/services/apis/student";

export const addFeedback = createAsyncThunk(
	"feedback/addFeedback",
	async (feedbackData: any, thunkAPI) => {
		try {
			const { data } = await addFeedbackApi(feedbackData);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

export interface AddFeedbackState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	feedback: any;
	hasSubmittedFeedback: boolean;
}

const initialState: AddFeedbackState = {
	status: "idle",
	error: null,
	feedback: null,
	hasSubmittedFeedback: false,
};

const addFeedbackSlice = createSlice({
	name: "addFeedback",
	initialState,
	reducers: {
		resetAddFeedbackStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
		resetAddFeedbackState: (state) => {
			state.status = "idle";
			state.error = null;
			state.feedback = null;
			state.hasSubmittedFeedback = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(addFeedback.pending, (state) => {
				state.status = "loading";
			})
			.addCase(addFeedback.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.feedback = action.payload;
				state.hasSubmittedFeedback = true;
			})
			.addCase(addFeedback.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetAddFeedbackStatus, resetAddFeedbackState } =
	addFeedbackSlice.actions;
export default addFeedbackSlice.reducer;
