import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateDraftCaseApi } from "@/services/apis/case";
import { toast } from "react-toastify";
import { getTokenForRequest } from "@/utils/getTokenForRequest";

export const updateDraftCase = createAsyncThunk(
	"case/updateDraftCase",
	async ({ caseData, _id }: any, thunkAPI) => {
		try {
			const token = await getTokenForRequest();
			const { data } = await updateDraftCaseApi({ caseData, token, _id });
			toast.success("Draft case updated");

			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

interface UpdateCaseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	cases: any;
}

const initialState: UpdateCaseState = {
	status: "idle",
	error: null,
	cases: null,
};

const updateCaseSlice = createSlice({
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
			.addCase(updateDraftCase.pending, (state) => {
				state.status = "loading";
			})
			.addCase(updateDraftCase.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.cases = action.payload.draftCasesInfo;
			})
			.addCase(updateDraftCase.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetGetDraftCasesStatus } = updateCaseSlice.actions;
export default updateCaseSlice.reducer;
