import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { changePasswordApi } from "@/services/apis/auth";
import { RootState } from "@/store/rootReducer/rootReducer";
import { getTokenForRequest } from "@/utils/getTokenForRequest";

export const changePassword = createAsyncThunk(
	"auth/changePassword",
	async (passwordData: any, thunkAPI) => {
		try {
			const token = await getTokenForRequest();
			const { data } = await changePasswordApi(passwordData, token);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

export interface ChangePasswordState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	passwordResponse: any;
}

const initialState: ChangePasswordState = {
	status: "idle",
	error: null,
	passwordResponse: null,
};

const changePasswordSlice = createSlice({
	name: "changePassword",
	initialState,
	reducers: {
		resetChangePasswordStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(changePassword.pending, (state) => {
				state.status = "loading";
			})
			.addCase(changePassword.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.passwordResponse = action.payload;
			})
			.addCase(changePassword.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetChangePasswordStatus } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
