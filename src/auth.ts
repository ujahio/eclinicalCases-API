import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "next-auth/jwt";
import { authApi } from "./services/config/axiosConfig";

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		id?: string;
		firstName?: string;
		lastName?: string;
		user_role?: string;
		accessTokenExpires?: number;
		refreshToken?: string;
	}
}

declare module "next-auth" {
	interface User {
		id?: string;
		firstName?: string;
		lastName?: string;
		user_role?: string;
		accessToken?: string;
		refreshToken?: string;
	}

	interface Session extends DefaultSession {
		accessToken?: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			user_role: string;
		};
		error: any;
	}
}

const authOptions: NextAuthConfig = {
	trustHost: true,
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (credentials) => {
				try {
					const { data } = await authApi.post("/signin", {
						email: credentials.email,
						password: credentials.password,
					});

					// Return user and tokens on successful login
					if (data.accessToken) {
						return {
							id: data.id,
							firstName: data.firstName,
							lastName: data.lastName,
							user_role: data.user_role,
							accessToken: data.accessToken,
							refreshToken: data.refreshToken,
						};
					}
					return null;
				} catch (error) {
					console.error("Login error:", error);
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			const ACCESS_TOKEN_EXPIRES_IN: number = process.env
				.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN
				? parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN, 10) * 1000
				: 3600 * 1000;

			if (user) {
				token.accessToken = user.accessToken;
				token.refreshToken = user.refreshToken;
				token.accessTokenExpires = Date.now() + ACCESS_TOKEN_EXPIRES_IN;
				token.id = user.id;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.user_role = user.user_role;
				token.email = user.email;
			}

			// If the token is still valid, return it
			if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
				return token;
			}

			// If the token has expired, refresh it
			if (!token.accessTokenExpires || Date.now() >= token.accessTokenExpires) {
				console.log("Access token has expired, refreshing...");

				try {
					const response = await authApi.post("/refresh-token", {
						refreshToken: token.refreshToken,
					});
					const refreshedData = response.data;
					// Update token with refreshed details
					token.accessToken = refreshedData.accessToken;
					token.accessTokenExpires =
						Date.now() + refreshedData.expiresIn * 1000; // New expiration time
					token.refreshToken = refreshedData.refreshToken || token.refreshToken; // Retain same refresh token if not updated
				} catch (error) {
					console.error("Failed to refresh token:", error);
					return {
						...token,
						error: "RefreshAccessTokenError",
					};
				}
			}

			return token;
		},

		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.user = {
				id: token.id!,
				firstName: token.firstName!,
				lastName: token.lastName!,
				user_role: token.user_role!,
				email: token.email!,
				emailVerified: null,
			};

			// Pass any token error to the session
			if (token.error) {
				session.error = token.error;
			}

			return session;
		},
		async authorized({ auth }) {
			return !!auth;
		},
	},
	pages: {
		signIn: "/login", // This sets the custom path for the login page
	},
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
