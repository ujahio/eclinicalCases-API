import axios from "axios";
import { caseApi, configureRequestHeaders } from "../config/axiosConfig";

const convertToFormData = (caseStudy: any) => {
	const formData = new FormData();

	// refactor to remove scenarios for caseMaterials and caseQuestions
	for (const key in caseStudy) {
		if (key === "caseQuestions") {
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

export const updateDraftCaseApi = (caseData: any, token: string, _id: any) => {
	const formData = convertToFormData(caseData);
	return caseApi.put(`/draft/${_id}`, formData, configureRequestHeaders(token));
};

export const getArchiveCasesApi = (token: string, isRecent?: string) => {
	const url = isRecent ? `/archived/?caseFilter=${isRecent}` : "/archived/";

	return caseApi.get(url, configureRequestHeaders(token));
};

export const getDraftCasesApi = (caseId: string, token: string) => {
	const url = caseId ? `/draft/${caseId}` : `/draft/`;
	return caseApi.get(url, configureRequestHeaders(token));
};

export const fetchCaseDetailsApi = (caseId: any, token: string) => {
	return caseApi.get(`/details/${caseId}`, configureRequestHeaders(token));
};

export const fetchPublishedCaseApi = (token: string) => {
	return caseApi.get("/publish", configureRequestHeaders(token));
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

export const getPresignedUrlForDocumentUploadApi = (token: string) => {
	return caseApi.get(
		"/get-signed-url-for-pdf-upload",
		configureRequestHeaders(token)
	);
};

export const getPresignedUrlForFetchingDocumentsApi = (
	documentKeys: string[],
	token: string
) => {
	return caseApi.post("/get-signed-url-for-pdf-fetch", {
		data: { documentKeys },
		...configureRequestHeaders(token),
	});
};

export const addPdfToCaseMaterialsApi = async ({
	pdfUrl,
	selectedFile,
}: {
	pdfUrl: string;
	selectedFile: File;
}) => {
	await axios.put(pdfUrl, selectedFile, {
		headers: {
			"Content-Type": selectedFile.type || "application/octet-stream",
		},
	});
};

export const deletePdfFromCaseMaterialsApi = (
	fileKey: string,
	token: string
) => {
	return caseApi.delete("/delete-case-material", {
		data: { fileKey },
		...configureRequestHeaders(token),
	});
};
