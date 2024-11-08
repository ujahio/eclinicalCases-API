import { getSession } from "next-auth/react";

export const getTokenForRequest = async () => {
	const session = await getSession();
	return session?.accessToken;
};
