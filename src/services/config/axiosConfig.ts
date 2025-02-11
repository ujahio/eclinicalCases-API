import axios from "axios";
import { handleApiError } from "../../utils/errorHandler";
import { getSession } from "next-auth/react";

export const authApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
});
export const caseApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/case`,
});
export const studentApi = axios.create({
	baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
});

caseApi.interceptors.request.use(
	async (config) => {
		const session = await getSession();
		if (session?.accessToken) {
			config.headers.Authorization = `Bearer ${session.accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

studentApi.interceptors.request.use(
	async (config) => {
		const session = await getSession();
		if (session?.accessToken) {
			config.headers.Authorization = `Bearer ${session.accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

authApi.interceptors.response.use(null, handleApiError);
caseApi.interceptors.response.use(null, handleApiError);
studentApi.interceptors.response.use(null, handleApiError);

export const configureRequestHeaders = (formData?: any) => {
	const headers = {
		...(formData && formData.getHeaders
			? formData.getHeaders()
			: { "Content-Type": "multipart/form-data" }),
	};
	return {
		headers,
	};
};
