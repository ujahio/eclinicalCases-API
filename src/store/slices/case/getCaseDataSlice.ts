import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCaseDataApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const fetchCaseData = createAsyncThunk(
	"cases/fetchCaseData",
	async (caseId: string, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await fetchCaseDataApi(caseId, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface GetCaseDataState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	caseData: any;
}

const initialState: GetCaseDataState = {
	status: "idle",
	error: null,
	caseData: {},
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
				state.caseData = action.payload;
			})
			.addCase(fetchCaseData.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetCaseDataStatus } = getCaseDataSlice.actions;
export default getCaseDataSlice.reducer;
