import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCaseDataApi } from "@/services/apis/case";

export const fetchCaseData = createAsyncThunk(
	"cases/fetchCaseData",
	async (caseId: string, thunkAPI) => {
		try {
			const { data } = await fetchCaseDataApi(caseId);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

export interface GetCaseDataState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	caseData: any;
}

const initialState: GetCaseDataState = {
	status: "idle",
	error: null,
	caseData: {
		caseInfo: {},
		responsesAndFeedbackInfo: [],
	},
};

const getCaseDataSlice = createSlice({
	name: "getCaseData",
	initialState,
	reducers: {
		resetCaseDataStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCaseData.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchCaseData.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.caseData.responsesAndFeedbackInfo = action.payload.responseItems;
				state.caseData.caseInfo = action.payload.caseInfo;
			})
			.addCase(fetchCaseData.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetCaseDataStatus } = getCaseDataSlice.actions;
export default getCaseDataSlice.reducer;
