"use client";

import AccountSettings from "@/presentation/student/Settings";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return <AccountSettings />;
};

export default Page;
