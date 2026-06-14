import { authApi, configureRequestHeaders } from "../config/fetchClient";
import { setAuthCookie, clearAuthCookie } from "@/utils/cookies";
import { getAuthCookie } from "@/utils/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const signup = (formData: any) => authApi.post("/signup", formData);

export const login = (formData: any) => {
	const { password, email } = formData;
	return authApi.post("/signin", { email, password });
};

export async function signIn(email: string, password: string) {
	const response = await fetch(`${BASE_URL}/api/auth/signin`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		throw new Error("Sign-in failed");
	}

	const data = await response.json();

	const ACCESS_TOKEN_EXPIRES_IN = process.env
		.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN
		? parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN, 10) * 1000
		: 3600 * 1000;

	setAuthCookie({
		accessToken: data.accessToken,
		refreshToken: data.refreshToken,
		accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
		id: data.id,
		firstName: data.firstName,
		lastName: data.lastName,
		user_role: data.user_role,
		email: data.email,
	});

	return data;
}

export async function signOut() {
	clearAuthCookie();
	window.location.href = "/login";
}

export async function refreshToken() {
	const cookieData = getAuthCookie();
	if (!cookieData?.refreshToken) {
		throw new Error("No refresh token");
	}

	// use authApi instead of importing fetch

	const response = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken: cookieData.refreshToken }),
	});

	if (!response.ok) {
		throw new Error("Refresh failed");
	}

	const data = await response.json();

	const ACCESS_TOKEN_EXPIRES_IN = process.env
		.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN
		? parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN, 10) * 1000
		: 3600 * 1000;

	setAuthCookie({
		...cookieData,
		accessToken: data.accessToken,
		refreshToken: data.refreshToken ?? cookieData.refreshToken,
		accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
	});

	return data;
}

export const resetPasswordApi = (passwordData: any) => {
	return authApi.post(`/reset-password`, passwordData);
};

export const sendOtpApi = (otpData: any) => {
	return authApi.post(`/send-otp`, otpData);
};

export const changePasswordApi = (passwordData: any) => {
	return authApi.post(
		`/update-password`,
		passwordData,
		configureRequestHeaders(),
	);
};
