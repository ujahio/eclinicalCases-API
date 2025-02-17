import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuthRedirect = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	useEffect(() => {
		if (status === "loading") {
			// Do nothing while loading
			return;
		}
		// Only sign out if there's no access token AND we're not in the process of refreshing
		if (!session?.accessToken && session?.error === "RefreshAccessTokenError") {
			// Add a small delay to prevent immediate signout during token refresh
			const timeoutId = setTimeout(() => {
				signOut({ callbackUrl: "/login" });
			}, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [session, status, router]);
	return { session, status };
};
