import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitCaseResponseApi } from "@/services/apis/student";
import { RootState } from "@/store/rootReducer/rootReducer";

export const submitCaseResponse = createAsyncThunk(
	"case/submitCaseResponse",
	async (responsePayload: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await submitCaseResponseApi(responsePayload, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || error.status, // temp fix to set status manually
				message: error.response?.data || error.message, // temp fix to set status manually
			});
		}
	}
);

interface SubmitCaseResponseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	response: any;
}

const initialState: SubmitCaseResponseState = {
	status: "idle",
	error: null,
	response: null,
};

const submitCaseResponseSlice = createSlice({
	name: "submitCaseResponse",
	initialState,
	reducers: {
		resetSubmitCaseResponseStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(submitCaseResponse.pending, (state) => {
				state.status = "loading";
			})
			.addCase(submitCaseResponse.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.response = action.payload;
			})
			.addCase(submitCaseResponse.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetSubmitCaseResponseStatus } =
	submitCaseResponseSlice.actions;

export default submitCaseResponseSlice.reducer;
