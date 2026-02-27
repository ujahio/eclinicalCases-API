import { useEffect } from "react";
import { useRouter } from "next/navigation";

export const useAuthRedirect = async () => {
	const session = await authClient.getSession();
	const router = useRouter();

	// replace with clerk session status if needed

	// useEffect(() => {
	// 	if (!session) {
	// 		router.replace("/login");
	// 		return;
	// 	}
	// 	// If a session exists but there's an error indicating a refresh token issue,
	// 	// trigger a sign out to clear any stale tokens.
	// 	if (session && !session?.data?.session.token) {
	// 		const timeoutId = setTimeout(async () => {
	// 			await authClient.signOut({
	// 				fetchOptions: {
	// 					onSuccess: () => {
	// 						router.push("/login");
	// 					},
	// 				},
	// 			});
	// 		}, 100);
	// 		return () => clearTimeout(timeoutId);
	// 	}
	// }, [session, router]);

	return { session, status };
};
