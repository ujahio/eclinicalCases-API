export { auth as middleware } from "@/auth";

export const config = {
	matcher: ["/student/:path*", "/teacher/:path*"],
};
