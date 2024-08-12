import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchOngoingCasesApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const fetchOngoingCases = createAsyncThunk("cases/fetchOngoingCases", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state?.login?.user?.token;
    const { data } = await fetchOngoingCasesApi(token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

interface OngoingCaseState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  cases: any;
}

const initialState: OngoingCaseState = {
  status: "idle",
  error: null,
  cases: null,
};

const onGoingCaseSlice = createSlice({
  name: "onGoingCase",
  initialState,
  reducers: {
    resetOngoingCaseStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOngoingCases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOngoingCases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cases = action.payload;
      })
      .addCase(fetchOngoingCases.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetOngoingCaseStatus } = onGoingCaseSlice.actions;
export default onGoingCaseSlice.reducer;
