import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCaseApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const deleteCase = createAsyncThunk(
	"cases/deleteCase",
	async (caseId: string, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await deleteCaseApi(caseId, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface DeleteCaseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	deletedCaseId: string | null;
}

const initialState: DeleteCaseState = {
	status: "idle",
	error: null,
	deletedCaseId: null,
};

const deleteCaseSlice = createSlice({
	name: "deleteCase",
	initialState,
	reducers: {
		resetDeleteCaseStatus: (state) => {
			state.status = "idle";
			state.error = null;
			state.deletedCaseId = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(deleteCase.pending, (state) => {
				state.status = "loading";
			})
			.addCase(deleteCase.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.deletedCaseId = action.payload;
			})
			.addCase(deleteCase.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetDeleteCaseStatus } = deleteCaseSlice.actions;
export default deleteCaseSlice.reducer;
