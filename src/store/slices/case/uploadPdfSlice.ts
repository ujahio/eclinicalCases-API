import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadPdfToS3Api } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const uploadPdf = createAsyncThunk(
	"case/upload-pdfs",
	async (pdfInfo: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await uploadPdfToS3Api(pdfInfo, token);

			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

interface UploadPdfState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
}

const initialState: UploadPdfState = {
	status: "idle",
	error: null,
};

const uploadPdfSlice = createSlice({
	name: "uploadPdf",
	initialState,
	reducers: {
		resetUploadPdfStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(uploadPdf.pending, (state) => {
				state.status = "loading";
			})
			.addCase(uploadPdf.fulfilled, (state, action) => {
				state.status = "succeeded";
			})
			.addCase(uploadPdf.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetUploadPdfStatus } = uploadPdfSlice.actions;
export default uploadPdfSlice.reducer;
