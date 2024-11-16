import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Custom hook to handle user authentication and redirect if unauthenticated
export const useAuthRedirect = () => {
	const { data, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated" || !data?.user) {
			// Redirect to login page or sign out if user data is missing
			router.push("/login");
			// Alternatively, you can sign out if needed
			// signOut();
		}
	}, [status, data, router]);

	// Return session data and loading state
	return { user: data?.user };
};
