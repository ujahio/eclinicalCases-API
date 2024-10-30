import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signup } from "@/services/apis/auth";

export const signupUser = createAsyncThunk(
	"auth/signup",
	async (signupData: any, thunkAPI) => {
		try {
			const filteredSignupData = {
				firstName: signupData.personalDetails.firstName,
				lastName: signupData.personalDetails.lastName,
				email: signupData.personalDetails.email,
				password: signupData.personalDetails.password,
				user_role: signupData.user_role,
			};
			const { data } = await signup(filteredSignupData);
			return data;
		} catch (error: any) {
			return thunkAPI.rejectWithValue(error.response.data);
		}
	}
);

interface signupState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	user: any;
	date: string | null;
}

const initialState: signupState = {
	status: "idle",
	error: null,
	user: null,
	date: null,
};
const signupSlice = createSlice({
	name: "signup",
	initialState,
	reducers: {
		resetStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
		resetUserStatus: (state) => {
			state.user = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(signupUser.pending, (state) => {
				state.status = "loading";
			})
			.addCase(signupUser.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.user = action.payload;
				state.date = new Date().toISOString();
			})
			.addCase(signupUser.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetStatus, resetUserStatus } = signupSlice.actions;
export default signupSlice.reducer;
