import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getPresignedUrlForDocumentUploadApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const getUrlToAddCaseMaterials = createAsyncThunk(
	"case/get-url-to-add-case-materials",
	async (_, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			const { data } = await getPresignedUrlForDocumentUploadApi(token);
			console.log("data", data);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response.status,
				message: error.response.data,
			});
		}
	}
);

interface GetUrlToAddCaseMaterialsState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
}

const initialState: GetUrlToAddCaseMaterialsState = {
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
			.addCase(getUrlToAddCaseMaterials.pending, (state) => {
				state.status = "loading";
			})
			.addCase(getUrlToAddCaseMaterials.fulfilled, (state, action) => {
				state.status = "succeeded";
			})
			.addCase(getUrlToAddCaseMaterials.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetUploadPdfStatus } = urlToAddCaseMaterialsSlice.actions;
export default urlToAddCaseMaterialsSlice.reducer;
