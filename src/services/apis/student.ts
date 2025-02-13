import { configureRequestHeaders, studentApi } from "../config/axiosConfig";

export const addFeedbackApi = (feedbackData: any) => {
	return studentApi.post(
		`/case/add/feedback`,
		feedbackData,
		configureRequestHeaders()
	);
};

export const getStudentsResponsesApi = (isRecent: any) => {
	const url = isRecent
		? `/student/responses/?caseFilter=${isRecent}`
		: "/student/responses/";
	return studentApi.get(url, configureRequestHeaders());
};

export const submitCaseResponseApi = (responsePayload: any) => {
	return studentApi.post(
		"student/response",
		responsePayload,
		configureRequestHeaders()
	);
};

export const getStudentsCertificatesApi = () => {
	const url = "/student/certificates";
	return studentApi.get(url, configureRequestHeaders());
};
