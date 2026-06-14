import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthCookie } from "@/utils/cookies";
import { signOut } from "@/services/apis/auth";

export const useAuthRedirect = () => {
	const router = useRouter();
	const cookieData = getAuthCookie();

	useEffect(() => {
		if (!cookieData) {
			router.replace("/login");
			return;
		}

		if (!cookieData.accessToken) {
			const timeoutId = setTimeout(() => {
				signOut();
			}, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [cookieData, router]);

	const compatSession = cookieData
		? {
				accessToken: cookieData.accessToken,
				user: {
					id: cookieData.id,
					firstName: cookieData.firstName,
					lastName: cookieData.lastName,
					user_role: cookieData.user_role,
					email: cookieData.email,
				},
			}
		: null;

	return {
		session: compatSession,
		status: cookieData ? "authenticated" : "unauthenticated",
	};
};
