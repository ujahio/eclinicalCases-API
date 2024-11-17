import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export const getTokenForRequest = async () => {
	const session = await getSession();

	// Check for session error and redirect to login
	if (session?.error) {
		console.error("Session error detected:", session.error);
		redirect("/login"); // Redirect to login page
	}

	// Check for missing access token
	if (!session?.accessToken) {
		console.error("No access token available.");
		redirect("/login"); // Redirect to login page
	}

	return session.accessToken;
};
