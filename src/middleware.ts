import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(request: NextRequest) {
	const token = request.cookies.get("idToken")?.value; // Assume tokens are in cookies

	if (!token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	try {
		const decoded: any = jwtDecode(token);
		const currentTime = Math.floor(Date.now() / 1000);

		// Check expiration
		if (decoded.exp < currentTime) {
			return NextResponse.redirect(new URL("/login", request.url)); // Or trigger refresh
		}

		// Optional: Validate issuer, audience, etc., against Cognito config
		// if (decoded.iss !== "https://cognito-idp.{region}.amazonaws.com/{userPoolId}") {
		//   throw new Error("Invalid token");
		// }

		return NextResponse.next();
	} catch (error) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
}

export const config = {
	matcher: ["/teacher/:path*", "/student/:path*"], // Protect specific routes
};
