import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
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
	}

	interface Session extends DefaultSession {
		accessToken?: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			user_role: string;
		};
	}
}

const authOptions = {
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
			if (user) {
				token.accessToken = user.accessToken;
				token.id = user.id;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.user_role = user.user_role;
			}

			// Return the token, including tokens and user details
			return token;
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.user = {
				id: token.id!,
				firstName: token.firstName!,
				lastName: token.lastName!,
				user_role: token.user_role!,
			};
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
