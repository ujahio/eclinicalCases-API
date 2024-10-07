import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getArchiveCasesApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getArchiveCases = createAsyncThunk(
	"case/getArchiveCases",
	async (isRecent: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await getArchiveCasesApi(token, isRecent);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || error.status, // temp fix to set status manually
				message: error.response?.data || error.message, // temp fix to set status manually
			});
		}
	}
);

interface GetArchiveCasesState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	cases: any;
}

const initialState: GetArchiveCasesState = {
	status: "idle",
	error: null,
	cases: [],
};

const getArchiveCasesSlice = createSlice({
	name: "getArchiveCases",
	initialState,
	reducers: {
		resetGetArchiveCasesStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getArchiveCases.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getArchiveCases.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.cases = action.payload.archivedCasesInfo;
			})
			.addCase(getArchiveCases.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetGetArchiveCasesStatus } = getArchiveCasesSlice.actions;
export default getArchiveCasesSlice.reducer;
