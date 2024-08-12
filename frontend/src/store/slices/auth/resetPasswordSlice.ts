import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { resetPasswordApi } from "@/services/apis/auth";

export const resetPassword = createAsyncThunk("auth/resetPassword", async (passwordData: any, thunkAPI) => {
  try {
    const { data } = await resetPasswordApi(passwordData);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

interface ResetPasswordState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  passwordResponse: any;
}

const initialState: ResetPasswordState = {
  status: "idle",
  error: null,
  passwordResponse: null,
};

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState,
  reducers: {
    resetResetPasswordStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.passwordResponse = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetResetPasswordStatus } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
