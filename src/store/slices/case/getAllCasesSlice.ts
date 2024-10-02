import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCasesApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getAllCases = createAsyncThunk(
	"case/getAllCases",
	async (isRecent: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await getAllCasesApi(token, isRecent);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || error.status, // temp fix to set status manually
				message: error.response?.data || error.message, // temp fix to set status manually
			});
		}
	}
);

interface GetAllCasesState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	cases: any;
}

const initialState: GetAllCasesState = {
	status: "idle",
	error: null,
	cases: [],
};

const getAllCasesSlice = createSlice({
	name: "getAllCases",
	initialState,
	reducers: {
		resetGetAllCasesStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAllCases.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getAllCases.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.cases = action.payload;
			})
			.addCase(getAllCases.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetGetAllCasesStatus } = getAllCasesSlice.actions;
export default getAllCasesSlice.reducer;
