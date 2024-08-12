import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login } from "@/services/apis/auth";
export const loginUser = createAsyncThunk("auth/login", async (loginData: any, thunkAPI) => {
  try {
    const { data } = await login(loginData);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});
interface loginState {
  isLoggedIn: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  user: any;
}

const initialState: loginState = {
  isLoggedIn: false,
  status: "idle",
  error: null,
  user: null,
};
const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});
export const { resetStatus, logout } = loginSlice.actions;
export default loginSlice.reducer;
