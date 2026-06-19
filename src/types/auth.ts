export interface Session {
	accessToken: string | null;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		user_role: string;
		email: string;
	};
	error?: string;
}

export interface AuthCookieData {
	accessToken: string;
	refreshToken: string;
	accessTokenExpires: number;
	id: string;
	firstName: string;
	lastName: string;
	user_role: string;
	email: string;
}
