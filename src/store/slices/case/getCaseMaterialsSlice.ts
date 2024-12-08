import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	getPresignedUrlForDocumentUploadApi,
	getPresignedUrlForFetchingDocumentsApi,
} from "@/services/apis/case";
import { getTokenForRequest } from "@/utils/getTokenForRequest";

export const getCaseMaterials = createAsyncThunk(
	"case/get-case-materials",
	async (
		{
			fileProcess,
			documentKeys = [],
		}: {
			fileProcess: "upload" | "download";
			documentKeys?: string[];
		},
		thunkAPI
	) => {
		try {
			const token = await getTokenForRequest();

			if (fileProcess === "upload") {
				const { data } = await getPresignedUrlForDocumentUploadApi(token);
				return data; // Contains { pdfUrl, documentKey }
			}

			if (fileProcess === "download") {
				const { data } = await getPresignedUrlForFetchingDocumentsApi({
					documentKeys,
					token,
				});

				return { signedUrls: data.signedUrls }; // Return fresh URLs
			}
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || 500,
				message: error.response?.data || "An error occurred",
			});
		}
	}
);

export interface CaseMaterialsState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	pdfMaterials: Record<
		string,
		{
			pdfUrl: string;
		}
	>;
}

const initialState: CaseMaterialsState = {
	status: "idle",
	error: null,
	pdfMaterials: {}, // Initialize materials cache
};

const caseMaterialsSlice = createSlice({
	name: "caseMaterials",
	initialState,
	reducers: {
		resetUploadPdfStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getCaseMaterials.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getCaseMaterials.fulfilled, (state, action) => {
				state.status = "succeeded";

				// If the action contains new signed URLs, add them to the cache
				if (!action.payload.cached && action.payload.signedUrls) {
					action.payload.signedUrls.forEach(
						({
							documentKey,
							pdfUrl,
						}: {
							documentKey: string;
							pdfUrl: string;
						}) => {
							state.pdfMaterials[documentKey] = {
								pdfUrl,
							};
						}
					);
				}
			})
			.addCase(getCaseMaterials.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetUploadPdfStatus } = caseMaterialsSlice.actions;
export default caseMaterialsSlice.reducer;
