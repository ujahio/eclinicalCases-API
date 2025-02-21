import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuthRedirect = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;
		// If there's no session (user not authenticated) then redirect to /login.
		if (status === "unauthenticated" || !session) {
			router.replace("/login");
			return;
		}
		// If a session exists but there's an error indicating a refresh token issue,
		// trigger a sign out to clear any stale tokens.
		if (
			session &&
			!session.accessToken &&
			session.error === "RefreshAccessTokenError"
		) {
			const timeoutId = setTimeout(() => {
				signOut({ callbackUrl: "/login" });
			}, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [session, status, router]);

	return { session, status };
};
