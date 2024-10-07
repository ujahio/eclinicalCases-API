import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDraftCasesApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getDraftCases = createAsyncThunk(
	"case/getDraftCases",
	async (caseId: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await getDraftCasesApi(caseId, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || error.status, // temp fix to set status manually
				message: error.response?.data || error.message, // temp fix to set status manually
			});
		}
	}
);

interface GetDraftCasesState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	cases: any;
}

const initialState: GetDraftCasesState = {
	status: "idle",
	error: null,
	cases: [],
};

const getDraftCasesSlice = createSlice({
	name: "getDraftCases",
	initialState,
	reducers: {
		resetGetDraftCasesStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getDraftCases.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getDraftCases.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.cases = action.payload.draftCasesInfo;
			})
			.addCase(getDraftCases.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetGetDraftCasesStatus } = getDraftCasesSlice.actions;
export default getDraftCasesSlice.reducer;
