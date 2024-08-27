import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateCaseApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const updateCase = createAsyncThunk("case/updateCase", async ({ caseData, _id }: any, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state?.login?.user?.token;
    const { data } = await updateCaseApi(caseData, token, _id);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ status: error.response.status, message: error.response.data });
  }
});

interface UpdateCaseState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  updatedCase: any;
}

const initialState: UpdateCaseState = {
  status: "idle",
  error: null,
  updatedCase: null,
};

const updateCaseSlice = createSlice({
  name: "updateCase",
  initialState,
  reducers: {
    resetUpdateCaseStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.updatedCase = action.payload;
      })
      .addCase(updateCase.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload.message;
      });
  },
});

export const { resetUpdateCaseStatus } = updateCaseSlice.actions;
export default updateCaseSlice.reducer;
