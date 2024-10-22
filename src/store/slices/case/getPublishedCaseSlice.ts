import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPublishedCaseApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getPublishedCase = createAsyncThunk(
	"cases/getPublishedCase",
	async (_, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data: pubishedCase } = await fetchPublishedCaseApi(token);
			return pubishedCase;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface PublishedCaseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	data: any;
}

const initialState: PublishedCaseState = {
	status: "idle",
	error: null,
	data: null,
};

const publishedCaseSlice = createSlice({
	name: "publishedCase",
	initialState,
	reducers: {
		resetOngoingCaseStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getPublishedCase.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getPublishedCase.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload.caseInfo;
			})
			.addCase(getPublishedCase.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetOngoingCaseStatus } = publishedCaseSlice.actions;
export default publishedCaseSlice.reducer;
