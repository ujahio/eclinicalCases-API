import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { verifyTokenFromCognito } from "../server/utils/verifyToken";
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
	},
	// pages: {
	// 	signIn: "/login",
	// 	error: "/error",
	// },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

// import NextAuth, { DefaultSession } from "next-auth";
// import NextAuthOptions from "next-auth";
// import { JWT } from "next-auth/jwt";
// import Cognito from "next-auth/providers/cognito";
// import { Resource } from "sst";
// import { verifyTokenFromCognito } from "../server/utils/verifyToken";

// declare module "next-auth/jwt" {
// 	/**
// 	 * Extended JWT object to include access token and user properties
// 	 */
// 	interface JWT {
// 		accessToken?: string;
// 		id?: string;
// 		firstName?: string;
// 		lastName?: string;
// 		user_role?: string;
// 		accessTokenExpires?: number;
// 		refreshToken?: string;
// 	}
// }

// declare module "next-auth" {
// 	/**
// 	 * Extended user object to include custom properties
// 	 */
// 	interface User {
// 		id?: string;
// 		firstName?: string;
// 		lastName?: string;
// 		user_role?: string;
// 	}

// 	/**
// 	 * Extended session object to include access token and user details
// 	 */
// 	interface Session extends DefaultSession {
// 		accessToken?: string;
// 		user: {
// 			id: string;
// 			firstName: string;
// 			lastName: string;
// 			user_role: string;
// 		};
// 	}
// }

// const stagePrefix =
// 	Resource.App.stage.toLowerCase() === "production"
// 		? ""
// 		: `${Resource.App.stage.toLowerCase()}.`;

// const cognitoWebClient = `${stagePrefix}eccswebclient`;

// console.log("AUTH RESOURCES", {
// 	clientId: Resource[cognitoWebClient].id,
// 	clientSecret: Resource[cognitoWebClient].secret,
// });

// const authOptions = {
//   debug: true,
// 	theme: { logo: "https://next-auth.js.org/img/logo/logo-sm.png" },
// 	providers: [
// 		Cognito({
// 			clientId: Resource[cognitoWebClient].id,
// 			clientSecret: Resource[cognitoWebClient].secret,
// 			issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${Resource.eccslabs.id}`,
// 		}),
// 	],
// 	callbacks: {
// 		async authorized({ request, token }) {
// 			const { pathname } = request.nextUrl;

// 			// Allow access to the login page for unauthenticated users
// 			if (!token) {
// 				// Allow public access to certain routes for unauthenticated users
// 				if (
// 					pathname === "/login" ||
// 					pathname === "/signup" ||
// 					pathname === "/admin" ||
// 					pathname === "/"
// 				) {
// 					return true;
// 				}
// 				// Deny access to all other routes if unauthenticated
// 				return false;
// 			}

// 			// Check if the user is authenticated
// 			// Restrict students from accessing the /admin route
// 			if (pathname.startsWith("/admin") && token.user_role === "student") {
// 				return false; // Deny access
// 			}

// 			// Restrict students from accessing the /admin route
// 			if (pathname.startsWith("/signup") && token.user_role === "teacher") {
// 				return false; // Deny access
// 			}

// 			// Deny access if the user is not authenticated
// 			return false;
// 		},
// 		async jwt({ token, account }) {
// 			// Initial sign-in
// 			if (account) {
// 				token.accessToken = account.access_token;

// 				// Verify and decode the ID token using verifyTokenFromCognito
// 				const { isValid, decoded, error } = await verifyTokenFromCognito(
// 					account.id_token!
// 				);

// 				if (isValid && decoded) {
// 					// Populate token with user details
// 					token.id = decoded.sub;
// 					token.firstName = decoded.given_name;
// 					token.lastName = decoded.family_name;
// 					token.user_role = decoded["custom:user_role"];
// 				} else {
// 					console.error("Failed to verify ID token:", error);
// 				}
// 			}

// 			return token;
// 		},
// 		async session({ session, token }) {
// 			// Add accessToken and user details to the session object
// 			session.accessToken = token.accessToken;
// 			session.user = {
// 				id: token.id as string, // Use `as string` to ensure type compatibility
// 				firstName: token.firstName as string,
// 				lastName: token.lastName as string,
// 				user_role: token.user_role as string,
// 			};
// 			return session;
// 		},
// 	},
// };

// export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
