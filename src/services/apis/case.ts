import { caseApi, configureRequestHeaders } from "../config/fetchClient";

const convertToFormData = (caseStudy: any) => {
	const formData = new FormData();

	for (const key in caseStudy) {
		if (key === "caseMaterials") {
			formData.append(key, JSON.stringify(caseStudy.caseMaterials));
		} else if (key === "caseQuestions") {
			formData.append(key, JSON.stringify(caseStudy[key]));
		} else {
			formData.append(key, caseStudy[key]);
		}
	}

	return formData;
};

export const publishCaseApi = (caseData: any) => {
	const formData = convertToFormData(caseData);
	return caseApi.post("/publish", formData, configureRequestHeaders(formData));
};

export const addDraftCaseApi = (draftCaseData: any) => {
	const formData = convertToFormData(draftCaseData);
	return caseApi.post("/draft", formData, configureRequestHeaders(formData));
};

export const updateDraftCaseApi = (caseData: any) => {
	const formData = convertToFormData(caseData);
	return caseApi.put(
		`/draft/${caseData.id}`,
		formData,
		configureRequestHeaders(formData),
	);
};

export const getArchiveCasesApi = (filterParam?: string) => {
	const url = filterParam
		? `/archived/?caseFilter=${filterParam}`
		: "/archived/";
	return caseApi.get(url, configureRequestHeaders());
};

export const getDraftCasesApi = () => {
	return caseApi.get("/draft", configureRequestHeaders());
};

export const fetchCaseDetailsApi = (caseId: any) => {
	return caseApi.get(`/details/${caseId}`, configureRequestHeaders());
};

export const fetchPublishedCaseApi = () => {
	return caseApi.get("/publish", configureRequestHeaders());
};
export const deleteCaseApi = (caseId: string) => {
	return caseApi.delete(`/delete-case/${caseId}`, configureRequestHeaders());
};

export const fetchCaseDataApi = (caseId: string) => {
	return caseApi.get(`/data/${caseId}`, configureRequestHeaders());
};

export const getPresignedUrlForDocumentUploadApi = (contentType?: string) => {
	const url = contentType
		? `/get-signed-url-for-pdf-upload?contentType=${encodeURIComponent(contentType)}`
		: "/get-signed-url-for-pdf-upload";
	return caseApi.get(url, configureRequestHeaders());
};

export const getPresignedUrlForFetchingDocumentsApi = ({
	documentKeys,
}: {
	documentKeys: string[];
}) => {
	const formData = new FormData();

	// Append each documentKey as unique form data fields
	documentKeys.forEach((documentKey, index) => {
		formData.append(`documentKeys[${index}]`, documentKey); // Append each documentKey
	});

	return caseApi.post(
		"/get-signed-url-for-pdf-fetch",
		formData,
		configureRequestHeaders(formData),
	);
};

export const addPdfToCaseMaterialsApi = async ({
	pdfUrl,
	selectedFile,
}: {
	pdfUrl: string;
	selectedFile: File;
}) => {
	try {
		await fetch(pdfUrl, {
			method: "PUT",
			headers: {
				"Content-Type": selectedFile.type || "application/octet-stream",
			},
			body: selectedFile,
		});
	} catch (error) {
		console.error("Error uploading PDF to presigned url:", error);
		throw error; // Rethrow the error to be handled by the caller
	}
};

export const deletePdfFromCaseMaterialsApi = (fileKey: string) => {
	return caseApi.delete("/delete-case-material", {
		data: { fileKey },
		...configureRequestHeaders(),
	});
};
