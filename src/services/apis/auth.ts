import { authApi, configureRequestHeaders } from "../config/axiosConfig";

export const signup = (formData: any) => authApi.post("/signup", formData);

export const login = (formData: any) => {
	const { password, email } = formData;
	return authApi.post("/signin", { email, password });
};

export const resetPasswordApi = (passwordData: any) => {
	return authApi.post(`/reset-password`, passwordData);
};

export const sendOtpApi = (otpData: any) => {
	return authApi.post(`/send-otp`, otpData);
};

export const changePasswordApi = (passwordData: any, token?: string) => {
	return authApi.post(
		`/update-password`,
		passwordData,
		configureRequestHeaders(token)
	);
};
