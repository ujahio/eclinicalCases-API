import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStudentsCertificatesApi } from "@/services/apis/student";
import { getTokenForRequest } from "@/utils/getTokenForRequest";

export const getStudentsCertificates = createAsyncThunk(
	"student/getStudentsCertificates",
	async (_, thunkAPI) => {
		try {
			const token = await getTokenForRequest();
			const { data } = await getStudentsCertificatesApi(token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

export interface StudentsCertificatesState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	data: any;
}

const initialState: StudentsCertificatesState = {
	status: "idle",
	error: null,
	data: [],
};

const studentsCertificatesSlice = createSlice({
	name: "studentsCertificates",
	initialState,
	reducers: {
		resetStudentsCertificatesStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getStudentsCertificates.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getStudentsCertificates.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.data = action.payload.processedCertificates;
			})
			.addCase(getStudentsCertificates.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetStudentsCertificatesStatus } =
	studentsCertificatesSlice.actions;
export default studentsCertificatesSlice.reducer;
