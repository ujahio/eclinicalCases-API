import NextAuth, { DefaultSession } from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { Resource } from "sst";

declare module "next-auth" {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			/** The user's postal address. */
			id: string;
		} & DefaultSession["user"];
		accessToken: string;
	}
	interface JWT {
		/** OpenID ID Token */
		accessToken?: string;
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	// read here https://authjs.dev/getting-started/deployment#auth_trust_host
	// trustHost: true,
	theme: { logo: "https://next-auth.js.org/img/logo/logo-sm.png" },
	providers: [
		Cognito({
			clientId: Resource.eccswebclient.id,
			clientSecret: Resource.eccswebclient.secret,
			issuer:
				"https://cognito-idp." +
				process.env.NEXT_PUBLIC_REGION +
				".amazonaws.com/" +
				Resource.eccsuserpool.id,
		}),
	],
	callbacks: {
		// authorized({ request, auth }) {
		// 	try {
		// 		const { pathname } = request.nextUrl;
		// 		console.log(pathname);
		// 		if (pathname.startsWith("/protected-page")) return !!auth;
		// 		return true;
		// 	} catch (err) {
		// 		console.log(err);
		// 	}
		// },
		jwt({ token, account, profile, trigger, session }) {
			if (trigger === "update") token.name = session.user.email;
			return token;
		},
		session: async ({ session, token, user }) => {
			session.accessToken = token.accessToken;

			session.user.id = user.id;
			return session;
		},
	},
});
