"use client";

import AccountSettings from "@/presentation/student/Settings";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import React from "react";

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return <AccountSettings />;
};

export default Page;
