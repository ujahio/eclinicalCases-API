import { caseApi, configureRequestHeaders } from "../config/axiosConfig";

const convertToFormData = (caseStudy: any) => {
	const formData = new FormData();

	for (const key in caseStudy) {
		if (key === "caseMaterials") {
			for (let i = 0; i < caseStudy.caseMaterials.length; i++) {
				formData.append(`caseMaterials`, caseStudy.caseMaterials[i]);
			}
		} else if (key === "caseQuestions") {
			formData.append(key, JSON.stringify(caseStudy[key]));
		} else {
			formData.append(key, caseStudy[key]);
		}
	}

	return formData;
};

// export const addCaseApi = (caseData: any, token: string) => {
// 	const formData = convertToFormData(caseData);
// 	return caseApi.post(
// 		`/add`,
// 		formData,
// 		configureRequestHeaders(token, formData)
// 	);
// };

export const publishCaseApi = (caseData: any, token: string) => {
	const formData = convertToFormData(caseData);
	return caseApi.post(
		"/publish",
		formData,
		configureRequestHeaders(token, formData)
	);
};

export const addDraftCaseApi = (draftCaseData: any, token: string) => {
	const formData = convertToFormData(draftCaseData);
	return caseApi.post(
		`/draft`,
		formData,
		configureRequestHeaders(token, formData)
	);
};

export const updateCaseApi = (caseData: any, token: string, _id: any) => {
	const formData = convertToFormData(caseData);
	return caseApi.post(
		`/update/${_id}`,
		formData,
		configureRequestHeaders(token)
	);
};

export const getArchiveCasesApi = (token: string, isRecent?: string) => {
	let url = `/archived-cases/`;
	url += `?caseFilter=${isRecent}`;
	return caseApi.get(url, configureRequestHeaders(token));
};

export const getDraftCasesApi = (token: string, isRecent?: string) => {
	return caseApi.get("/draft", configureRequestHeaders(token));
};

export const fetchCaseDetailsApi = (caseId: any, token: string) => {
	return caseApi.get(`/details/${caseId}`, configureRequestHeaders(token));
};

export const fetchOngoingCasesApi = (token: string) => {
	return caseApi.get(`/ongoing-case`, configureRequestHeaders(token));
};
export const deleteCaseApi = (caseId: string, token: string) => {
	return caseApi.delete(
		`/delete-case/${caseId}`,
		configureRequestHeaders(token)
	);
};

export const fetchCaseDataApi = (caseId: string, token: string) => {
	return caseApi.get(`/data/${caseId}`, configureRequestHeaders(token));
};
