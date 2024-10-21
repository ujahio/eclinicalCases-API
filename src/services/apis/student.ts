import { configureRequestHeaders, studentApi } from "../config/axiosConfig";

const convertToFormData = (data: any) => {
	const formData = new FormData();
	for (const key in data) {
		if (data.hasOwnProperty(key)) {
			formData.append(key, JSON.stringify(data[key]));
		}
	}
	return formData;
};

export const addFeedbackApi = (feedbackData: any, token: string) => {
	const formData = convertToFormData(feedbackData);
	return studentApi.post(
		`/case/add/feedback`,
		feedbackData,
		configureRequestHeaders(token)
	);
};

export const generateCertificateApi = (certificateInfo: any, token: string) => {
	return studentApi.post(
		"/quiz/generate-certificate",
		certificateInfo,
		configureRequestHeaders(token, certificateInfo)
	);
};

export const getStudentsResponsesApi = (isRecent: any, token: string) => {
	const url = isRecent
		? `/student/responses/?caseFilter=${isRecent}`
		: "/student/responses/";
	return studentApi.get(url, configureRequestHeaders(token));
};

export const submitCaseResponseApi = (responsePayload: any, token: string) => {
	return studentApi.post(
		"student/response",
		responsePayload,
		configureRequestHeaders(token)
	);
};
