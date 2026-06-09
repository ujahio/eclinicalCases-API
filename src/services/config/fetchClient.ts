import { getSession } from "next-auth/react";
import { handleApiError } from "../../utils/errorHandler";

type HeadersObj = Record<string, string> | Headers;

function isFormData(value: any) {
	if (typeof FormData === "undefined") return false;
	return value instanceof FormData;
}

export function createApiClient(baseURL: string, withAuth = false) {
	const request = async (
		method: string,
		url: string,
		data?: any,
		config?: { headers?: Record<string, string>; data?: any },
	) => {
		try {
			const headers: Record<string, string> = {
				...(config?.headers || {}),
			};

			if (withAuth) {
				try {
					const session = await getSession();
					if (session && (session as any).accessToken) {
						headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
					}
				} catch (_) {
					// ignore session errors
				}
			}

			const fullUrl = `${baseURL}${url}`;

			// allow payload from either `data` or `config.data` (fetch-style)
			const payload = data === undefined ? config?.data : data;

			let body: any = undefined;
			if (payload !== undefined && payload !== null) {
				if (isFormData(payload)) {
					// Let the browser set Content-Type (boundary). Remove any Content-Type header.
					delete headers["Content-Type"];
					body = payload;
				} else if (typeof payload === "object") {
					headers["Content-Type"] =
						headers["Content-Type"] || "application/json";
					body = JSON.stringify(payload);
				} else {
					body = payload;
				}
			}

			const res = await fetch(fullUrl, {
				method,
				headers: headers as HeadersObj,
				body,
			});

			const text = await res.text();
			let parsed: any = text;
			try {
				parsed = text ? JSON.parse(text) : null;
			} catch (e) {
				// keep text
			}

			const responseLike = {
				data: parsed,
				status: res.status,
				headers: res.headers,
			};

			if (!res.ok) {
				const err: any = new Error(res.statusText || "Request failed");
				err.response = {
					data: parsed || { message: res.statusText },
					status: res.status,
				};
				// Keep existing error handling hook
				try {
					handleApiError(err);
				} catch (_) {
					// swallow
				}
				return Promise.reject(err);
			}

			return responseLike;
		} catch (error: any) {
			const err: any = new Error(error?.message || "Network error");
			err.response = { data: { message: error?.message || "Network error" } };
			try {
				handleApiError(err);
			} catch (_) {}
			return Promise.reject(err);
		}
	};

	return {
		get: (url: string, config?: any) => request("GET", url, undefined, config),
		post: (url: string, data?: any, config?: any) =>
			request("POST", url, data, config),
		put: (url: string, data?: any, config?: any) =>
			request("PUT", url, data, config),
		delete: (url: string, config?: any) =>
			request("DELETE", url, undefined, config),
		request,
	};
}

export const authApi = createApiClient(
	`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
	false,
);
export const caseApi = createApiClient(
	`${process.env.NEXT_PUBLIC_BASE_URL}/api/case`,
	true,
);
export const studentApi = createApiClient(
	`${process.env.NEXT_PUBLIC_BASE_URL}/api`,
	true,
);

export const configureRequestHeaders = (formData?: any) => {
	const headers = {
		...(formData && formData.getHeaders ? formData.getHeaders() : {}),
	};
	return {
		headers,
	};
};
