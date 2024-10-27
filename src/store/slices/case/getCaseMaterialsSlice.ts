import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	getPresignedUrlForDocumentUploadApi,
	getPresignedUrlForFetchingDocumentsApi,
} from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

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
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;

			// Handle uploads (no need to check state for existing URLs)
			if (fileProcess === "upload") {
				const { data } = await getPresignedUrlForDocumentUploadApi(token);
				return data; // Contains { pdfUrl, documentKey }
			}

			// Handle downloads: check for cached URLs first
			if (fileProcess === "download") {
				// if (!documentKeys || documentKeys.length === 0) {
				// 	throw new Error(
				// 		"documentKeys are required for downloading case materials."
				// 	);
				// }

				// const { pdfMaterials } = state.caseMaterials; // Cached materials

				// // Filter out documentKeys that are already in the state
				// const uncachedKeys = documentKeys.filter(
				// 	(docKey) => !pdfMaterials[docKey]
				// );

				// if (uncachedKeys.length === 0) {
				// 	// All URLs are cached, no need to fetch
				// 	return {
				// 		cached: true,
				// 		signedUrls: documentKeys.map((docKey) => pdfMaterials[docKey]),
				// 	};
				// }

				// Fetch only uncached URLs
				const { data } = await getPresignedUrlForFetchingDocumentsApi({
					documentKeys,
					token,
				});

				return { cached: false, signedUrls: data.signedUrls }; // Return fresh URLs
			}
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || 500,
				message: error.response?.data || "An error occurred",
			});
		}
	}
);

interface CaseMaterialsState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	pdfMaterials: Record<
		string,
		{
			pdfUrl: string;
			expiryTimestamp: number; // Expiry timestamp in milliseconds
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
							expiryTimestamp,
						}: {
							documentKey: string;
							pdfUrl: string;
							expiryTimestamp: number;
						}) => {
							state.pdfMaterials[documentKey] = {
								pdfUrl,
								expiryTimestamp,
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
