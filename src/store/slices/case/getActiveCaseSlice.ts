import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchActiveCaseApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getActiveCase = createAsyncThunk(
	"cases/getActiveCase",
	async (_, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await fetchActiveCaseApi(token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface OngoingCaseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	data: any;
}

const initialState: OngoingCaseState = {
	status: "idle",
	error: null,
	data: null,
};

const onGoingCaseSlice = createSlice({
	name: "onGoingCase",
	initialState,
	reducers: {
		resetOngoingCaseStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getActiveCase.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getActiveCase.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload.caseInfo;
			})
			.addCase(getActiveCase.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetOngoingCaseStatus } = onGoingCaseSlice.actions;
export default onGoingCaseSlice.reducer;
