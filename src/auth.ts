import NextAuth, { DefaultSession } from "next-auth";
import NextAuthOptions from "next-auth";
import { JWT } from "next-auth/jwt";
import Cognito from "next-auth/providers/cognito";
import { Resource } from "sst";
import { verifyTokenFromCognito } from "../server/utils/verifyToken";

declare module "next-auth/jwt" {
	/**
	 * Extended JWT object to include access token and user properties
	 */
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
	/**
	 * Extended user object to include custom properties
	 */
	interface User {
		id?: string;
		firstName?: string;
		lastName?: string;
		user_role?: string;
	}

	/**
	 * Extended session object to include access token and user details
	 */
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

const stagePrefix =
	Resource.App.stage.toLowerCase() === "production"
		? ""
		: `${Resource.App.stage.toLowerCase()}-`;

const cognitoWebClient = `${stagePrefix}eccswebclient`;

const authOptions = {
	theme: { logo: "https://next-auth.js.org/img/logo/logo-sm.png" },
	providers: [
		Cognito({
			clientId: Resource[cognitoWebClient].id,
			clientSecret: Resource[cognitoWebClient].secret,
			issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_REGION}.amazonaws.com/${Resource.eccslabs.id}`,
		}),
	],
	callbacks: {
		async authorized({ request, token }) {
			// Check if the user is authenticated
			if (token) {
				const { pathname } = request.nextUrl;

				// Restrict students from accessing the /admin route
				if (pathname.startsWith("/admin") && token.user_role === "student") {
					return false; // Deny access
				}

				// Restrict students from accessing the /admin route
				if (pathname.startsWith("/login") && token.user_role === "teacher") {
					return false; // Deny access
				}

				// Allow all other requests for authenticated users
				return true;
			}

			// Deny access if the user is not authenticated
			return false;
		},
		async jwt({ token, account }) {
			// Initial sign-in
			if (account) {
				token.accessToken = account.access_token;

				// Verify and decode the ID token using verifyTokenFromCognito
				const { isValid, decoded, error } = await verifyTokenFromCognito(
					account.id_token!
				);

				if (isValid && decoded) {
					// Populate token with user details
					token.id = decoded.sub;
					token.firstName = decoded.given_name;
					token.lastName = decoded.family_name;
					token.user_role = decoded["custom:user_role"];
				} else {
					console.error("Failed to verify ID token:", error);
				}
			}

			return token;
		},
		async session({ session, token }) {
			// Add accessToken and user details to the session object
			session.accessToken = token.accessToken;
			session.user = {
				id: token.id as string, // Use `as string` to ensure type compatibility
				firstName: token.firstName as string,
				lastName: token.lastName as string,
				user_role: token.user_role as string,
			};
			return session;
		},
	},
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
