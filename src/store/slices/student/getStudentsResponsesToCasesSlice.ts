import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStudentsResponsesApi } from "@/services/apis/student";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getStudentsResponsesToCases = createAsyncThunk(
	"student/getStudentsResponsesToCases",
	async (isRecent: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await getStudentsResponsesApi(isRecent, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface studentsResponsesToCasesState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	responses: any;
}

const initialState: studentsResponsesToCasesState = {
	status: "idle",
	error: null,
	responses: [],
};

const getStudentsResponsesToCasesSlice = createSlice({
	name: "studentsResponsesToCases",
	initialState,
	reducers: {
		resetGetStudentsResponsesToCasesStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getStudentsResponsesToCases.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getStudentsResponsesToCases.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.responses = action.payload.data;
			})
			.addCase(getStudentsResponsesToCases.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetGetStudentsResponsesToCasesStatus } =
	getStudentsResponsesToCasesSlice.actions;

export default getStudentsResponsesToCasesSlice.reducer;
