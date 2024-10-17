import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	getPresignedUrlForDocumentUploadApi,
	getPresignedUrlForFetchingDocumentsApi,
} from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getUrlToProcessCaseMaterials = createAsyncThunk(
	"case/get-url-to-process-case-materials",
	async (
		{
			fileProcess,
			documentKeys,
			fileNames,
		}: {
			fileProcess: "upload" | "download";
			documentKeys: string[];
			fileNames: string[];
		},
		thunkAPI
	) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			if (fileProcess === "upload") {
				const { data } = await getPresignedUrlForDocumentUploadApi(token);
				console.log("data", data);
				return data;
			} else if (fileProcess === "download") {
				const { data } = await getPresignedUrlForFetchingDocumentsApi({
					documentKeys,
					fileNames,
					token,
				});
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

interface getUrlToProcessCaseMaterialsState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
}

const initialState: getUrlToProcessCaseMaterialsState = {
	status: "idle",
	error: null,
};

const urlToAddCaseMaterialsSlice = createSlice({
	name: "urlToAddCaseMaterials",
	initialState,
	reducers: {
		resetUploadPdfStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getUrlToProcessCaseMaterials.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getUrlToProcessCaseMaterials.fulfilled, (state, action) => {
				state.status = "succeeded";
			})
			.addCase(getUrlToProcessCaseMaterials.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetUploadPdfStatus } = urlToAddCaseMaterialsSlice.actions;
export default urlToAddCaseMaterialsSlice.reducer;
