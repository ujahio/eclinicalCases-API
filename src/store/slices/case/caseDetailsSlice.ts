import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCaseDetailsApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const fetchCaseDetails = createAsyncThunk("case/fetchCaseDetails", async (caseId: any, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state?.login?.user?.token;
    const { data } = await fetchCaseDetailsApi(caseId, token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ status: error.response.status, message: error.response.data });
  }
});

interface CaseDetailsState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  caseDetails: any;
}

const initialState: CaseDetailsState = {
  status: "idle",
  error: null,
  caseDetails: null,
};

const caseDetailsSlice = createSlice({
  name: "caseDetails",
  initialState,
  reducers: {
    resetCaseDetailsStatus: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaseDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCaseDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.caseDetails = action.payload;
      })
      .addCase(fetchCaseDetails.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCaseDetailsStatus } = caseDetailsSlice.actions;
export default caseDetailsSlice.reducer;
