export { auth as proxy } from "@/auth";

export const config = {
	matcher: ["/student/:path*", "/teacher/:path*"],
};
