import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addFeedbackApi } from "@/services/apis/student";
import { RootState } from "@/store/rootReducer/rootReducer";

export const addFeedback = createAsyncThunk("feedback/addFeedback", async (feedbackData: any, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state?.login?.user?.token;
    const { data } = await addFeedbackApi(feedbackData, token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ status: error.response.status, message: error.response.data });
  }
});

interface AddFeedbackState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  feedback: any;
}

const initialState: AddFeedbackState = {
  status: "idle",
  error: null,
  feedback: null,
};

const addFeedbackSlice = createSlice({
  name: "addFeedback",
  initialState,
  reducers: {
    resetAddFeedbackStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFeedback.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.feedback = action.payload;
      })
      .addCase(addFeedback.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetAddFeedbackStatus } = addFeedbackSlice.actions;
export default addFeedbackSlice.reducer;
