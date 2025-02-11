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
		if (!session?.accessToken || session?.error === "RefreshAccessTokenError") {
			// If there is no access token, sign out and redirect to login
			signOut({ callbackUrl: "/login" });
		}
	}, [session, status, router]);
	return { session, status };
};
