import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addDraftCaseApi, publishCaseApi } from "@/services/apis/case";

export const addCase = createAsyncThunk(
	"case/addCase",
	async (caseData: any, thunkAPI) => {
		try {
			if (caseData.shouldPublish) {
				const { data } = await publishCaseApi(caseData);
				return data;
			} else {
				const { data } = await addDraftCaseApi(caseData);
				return data;
			}
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

export interface AddCaseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	newCase: any;
}

const initialState: AddCaseState = {
	status: "idle",
	error: null,
	newCase: null,
};

const addCaseSlice = createSlice({
	name: "addCase",
	initialState,
	reducers: {
		resetAddCaseStatus: (state) => {
			state.status = "idle";
			state.error = null;
			state.newCase = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(addCase.pending, (state) => {
				state.status = "loading";
			})
			.addCase(addCase.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.newCase = action.payload;
			})
			.addCase(addCase.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetAddCaseStatus } = addCaseSlice.actions;
export default addCaseSlice.reducer;
