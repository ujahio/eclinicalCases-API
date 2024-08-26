import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendOtpApi } from "@/services/apis/auth";

export const sendOtp = createAsyncThunk("auth/sendOtp", async (otpData: any, thunkAPI) => {
  try {
    const { data } = await sendOtpApi(otpData);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

interface SendOtpState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  otpResponse: any;
}

const initialState: SendOtpState = {
  status: "idle",
  error: null,
  otpResponse: null,
};

const sendOtpSlice = createSlice({
  name: "sendOtp",
  initialState,
  reducers: {
    resetSendOtpStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.otpResponse = action.payload;
      })
      .addCase(sendOtp.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetSendOtpStatus } = sendOtpSlice.actions;
export default sendOtpSlice.reducer;
