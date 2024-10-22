import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
	submitCaseResponseApi,
	generateCertificateApi,
} from "@/services/apis/student";
import { RootState } from "@/store/rootReducer/rootReducer";

export const submitCaseResponse = createAsyncThunk(
	"case/submitCaseResponse",
	async (responsePayload: any, thunkAPI) => {
		try {
			const state = thunkAPI.getState() as RootState;
			const token = state?.login?.user?.token;
			// const { data: studentsGrade } = await submitCaseResponseApi(
			// 	responsePayload,
			// 	token
			// );
			// temp comment out until pdf generation is implemented
			// if (studentsGrade.passed) {
			// make new request to create certificate if quiz is passed
			// const { data: certificateInformation } = await generateCertificateApi(
			// 	{ caseTopic: responsePayload.caseTopicAnswer },
			// 	token
			// );

			const { data: certificateInformation } = await generateCertificateApi(
				{ caseTopic: "MALARIA" },
				token
			);

			console.log("certificateInformation", certificateInformation);

			// return {
			// passed: studentsGrade.passed,
			// 	pdfURL: certificateInformation.pdfURL,
			// 	pngURL: certificateInformation.pngURL,
			// 	messageToDisplay: studentsGrade.messageToDisplay,
			// };
			// }
			// if quizzes are failed, we need to indicate what questions weren't passed and display a banner
			// return {
			// 	passed: studentsGrade.passed,
			// 	messageToDisplay: studentsGrade.messageToDisplay,
			// 	pdfURL: "",
			// 	pngURL: "",
			// };
		} catch (error: any) {
			return thunkAPI.rejectWithValue({
				status: error.response?.status || error.status, // temp fix to set status manually
				message: error.response?.data || error.message, // temp fix to set status manually
			});
		}
	}
);

interface SubmitCaseResponseState {
	status: "idle" | "loading" | "succeeded" | "failed";
	error: any;
	response: any;
}

const initialState: SubmitCaseResponseState = {
	status: "idle",
	error: null,
	response: null,
};

const submitCaseResponseSlice = createSlice({
	name: "submitCaseResponse",
	initialState,
	reducers: {
		resetSubmitCaseResponseStatus: (state) => {
			state.status = "idle";
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(submitCaseResponse.pending, (state) => {
				state.status = "loading";
			})
			.addCase(submitCaseResponse.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.response = action.payload;
			})
			.addCase(submitCaseResponse.rejected, (state, action: any) => {
				state.status = "failed";
				state.error = action.payload;
			});
	},
});

export const { resetSubmitCaseResponseStatus } =
	submitCaseResponseSlice.actions;

export default submitCaseResponseSlice.reducer;
