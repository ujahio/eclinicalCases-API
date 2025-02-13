import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCaseDetailsApi } from "@/services/apis/case";

export const fetchCaseDetails = createAsyncThunk(
	"case/fetchCaseDetails",
	async (caseId: any, thunkAPI) => {
		try {
			const { data } = await fetchCaseDetailsApi(caseId);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

export interface CaseDetailsState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	data: any;
}

const initialState: CaseDetailsState = {
	status: "idle",
	error: null,
	data: null,
};

const caseDetailsSlice = createSlice({
	name: "caseDetails",
	initialState,
	reducers: {
		resetCaseDetailsStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCaseDetails.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchCaseDetails.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload.caseInfo;
			})
			.addCase(fetchCaseDetails.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetCaseDetailsStatus } = caseDetailsSlice.actions;
export default caseDetailsSlice.reducer;
