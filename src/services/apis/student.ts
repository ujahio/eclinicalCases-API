import { configureRequestHeaders, studentApi } from "../config/axiosConfig";

export const addFeedbackApi = (feedbackData: any, token?: string) => {
	return studentApi.post(
		`/case/add/feedback`,
		feedbackData,
		configureRequestHeaders(token)
	);
};

export const getStudentsResponsesApi = (isRecent: any, token?: string) => {
	const url = isRecent
		? `/student/responses/?caseFilter=${isRecent}`
		: "/student/responses/";
	return studentApi.get(url, configureRequestHeaders(token));
};

export const submitCaseResponseApi = (responsePayload: any, token?: string) => {
	return studentApi.post(
		"student/response",
		responsePayload,
		configureRequestHeaders(token)
	);
};

export const getStudentsCertificatesApi = (token?: string) => {
	const url = "/student/certificates";
	return studentApi.get(url, configureRequestHeaders(token));
};
