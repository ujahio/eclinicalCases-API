import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const eccsAuthCookie = request.cookies.get("eccs_auth_data");

	if (!eccsAuthCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/student/:path*", "/teacher/:path*"],
};
