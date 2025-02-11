import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Custom hook to handle user authentication and redirect if unauthenticated
export const useAuthRedirect = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (
			status === "unauthenticated" ||
			!session?.user ||
			!session?.accessToken
		) {
			// Redirect to login page or sign out if user data is missing
			router.push("/login");
			// Alternatively, you can sign out if needed
			// signOut();
		}
	}, [status, session, router]);

	// Return session data and loading state
	return { session, status };
};
