import axios from "axios";
import { handleApiError } from "../../utils/errorHandler";

export const authApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
});
export const caseApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/case`,
});
export const studentApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
});

authApi.interceptors.response.use(null, handleApiError);
caseApi.interceptors.response.use(null, handleApiError);
studentApi.interceptors.response.use(null, handleApiError);

export const configureRequestHeaders = (token: string, formData?: any) => {
	const headers = {
		Authorization: `Bearer ` + token,
		...(formData ? formData.getHeaders() : {}),
	};
	return {
		headers,
	};
};
