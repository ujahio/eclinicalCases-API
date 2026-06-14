import { AuthCookieData } from "@/types/auth";

const COOKIE_NAME = "eccs_auth_data";

export function getAuthCookie(): AuthCookieData | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(
		new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`),
	);
	if (!match) return null;
	try {
		return JSON.parse(decodeURIComponent(match[2]));
	} catch {
		return null;
	}
}

export function setAuthCookie(data: AuthCookieData): void {
	const encoded = encodeURIComponent(JSON.stringify(data));
	document.cookie = `${COOKIE_NAME}=${encoded}; path=/; SameSite=Strict`;
	console.log("Auth cookie set:", { COOKIE: document.cookie });
}

export function clearAuthCookie(): void {
	document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
