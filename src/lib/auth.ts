import { betterAuth } from "better-auth";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
			strategy: "jwt",
			refreshCache: true,
		},
	},
});
