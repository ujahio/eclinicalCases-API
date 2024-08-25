import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addCaseApi } from "@/services/apis/case";
import { RootState } from "@/store/rootReducer/rootReducer";

export const addCase = createAsyncThunk("case/addCase", async (caseData: any, thunkAPI) => {
  try {
    const state = thunkAPI.getState() as RootState;
    const token = state?.login?.user?.token;
    const { data } = await addCaseApi(caseData, token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({ status: error.response.status, message: error.response.data });
  }
});

interface AddCaseState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: any;
  newCase: any;
}

const initialState: AddCaseState = {
  status: "idle",
  error: null,
  newCase: null,
};

const addCaseSlice = createSlice({
  name: "addCase",
  initialState,
  reducers: {
    resetAddCaseStatus: (state) => {
      state.status = "idle";
      state.error = null;
      state.newCase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addCase.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCase.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.newCase = action.payload;
      })
      .addCase(addCase.rejected, (state, action: any) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetAddCaseStatus } = addCaseSlice.actions;
export default addCaseSlice.reducer;
