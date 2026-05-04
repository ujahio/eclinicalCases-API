import NextAuth, {
	DefaultSession,
	NextAuthConfig,
	NextAuthRequest,
	Session,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "./services/config/axiosConfig";
import "next-auth/jwt";
import { JWT } from "next-auth/jwt";
import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from "next/types";

declare module "next-auth/jwt" {
	interface JWT {
		[key: string]: unknown;
		accessToken?: string | null;
		id?: string;
		firstName?: string;
		lastName?: string;
		user_role?: string;
		email?: string;
		accessTokenExpires?: number;
		refreshToken?: string | null;
		error?: string;
	}
}

declare module "next-auth" {
	interface User {
		id?: string;
		firstName?: string;
		lastName?: string;
		user_role?: string;
		email?: string | null;
		accessToken?: string;
		refreshToken?: string;
	}

	interface Session extends DefaultSession {
		accessToken?: string | null;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			user_role: string;
			email: string;
			emailVerified: any;
		};
		error?: string;
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
							email: data.email,
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
		async jwt({ token, user }): Promise<ReturnType<typeof jwtReturn>> {
			function jwtReturn(obj: JWT): JWT {
				return obj;
			}

			const ACCESS_TOKEN_EXPIRES_IN = process.env
				.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN
				? parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN, 10) * 1000
				: 3600 * 1000;

			// Initial sign in
			if (user) {
				return jwtReturn({
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
					accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRES_IN,
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					user_role: user.user_role,
					email: user.email ?? undefined,
				});
			}

			// Return previous token if the access token has not expired.
			if (
				token.accessToken &&
				token.accessTokenExpires &&
				Date.now() < token.accessTokenExpires
			) {
				return jwtReturn(token);
			}
			// Access token has expired; attempt to refresh it.
			try {
				console.log("Access token expired. Attempting to refresh...");
				const response = await authApi.post("/refresh-token", {
					refreshToken: token.refreshToken,
				});
				const refreshedData = response.data;

				return jwtReturn({
					...token,
					accessToken: refreshedData.accessToken,
					accessTokenExpires: Date.now() + refreshedData.expiresIn * 1000,
					refreshToken: refreshedData.refreshToken ?? token.refreshToken,
					error: undefined,
				});
			} catch (error) {
				console.error("Error refreshing token:", error);
				return jwtReturn({
					...token,
					accessToken: null,
					refreshToken: null,
					accessTokenExpires: 0,
					error: "RefreshAccessTokenError",
				});
			}
		},

		async session({
			session,
			token,
		}): Promise<ReturnType<typeof sessionReturn>> {
			function sessionReturn(obj: any): any {
				return obj;
			}

			if (token.error) {
				session.error = token.error;
			}
			session.accessToken = token.accessToken;
			session.user = {
				id: token.id as string,
				firstName: token.firstName as string,
				lastName: token.lastName as string,
				user_role: token.user_role as string,
				email: token.email as string,
				emailVerified: null,
			};

			return sessionReturn(session);
		},
	},
	pages: {
		signIn: "/login",
	},
};

const nextAuthInstance = NextAuth(authOptions);
export const handlers = nextAuthInstance.handlers;
export const signIn = nextAuthInstance.signIn;
export const signOut = nextAuthInstance.signOut;
export const auth: () => Promise<Session | null> = nextAuthInstance.auth;
