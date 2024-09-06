import axios from "axios";
import { handleApiError } from "../../utils/errorHandler";
import SECRETS from "../../../secrets";

export const authApi = axios.create({
	baseURL: `${SECRETS.NextPublicBaseUrl}/api/auth`,
});
export const caseApi = axios.create({
	baseURL: `${SECRETS.NextPublicBaseUrl}/api/case`,
});
export const studentApi = axios.create({
	baseURL: `${SECRETS.NextPublicBaseUrl}/api`,
});

authApi.interceptors.response.use(null, handleApiError);
caseApi.interceptors.response.use(null, handleApiError);
studentApi.interceptors.response.use(null, handleApiError);

export const config = (token: string) => {
	return {
		headers: {
			Authorization: `Bearer ` + token,
		},
	};
};
