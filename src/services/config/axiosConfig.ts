import axios from "axios";
import { handleApiError } from "../../utils/errorHandler";
import SECRETS from "../../../secrets";
const NextPublicBaseUrl = "http://localhost:8080";

export const authApi = axios.create({
	baseURL: `https://kar8mdtv17.execute-api.us-east-1.amazonaws.com/api/auth`,
});
export const caseApi = axios.create({
	baseURL: `https://kar8mdtv17.execute-api.us-east-1.amazonaws.com/api/case`,
});
export const studentApi = axios.create({
	baseURL: `https://kar8mdtv17.execute-api.us-east-1.amazonaws.com/api`,
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
