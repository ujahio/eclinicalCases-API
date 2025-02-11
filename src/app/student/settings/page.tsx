"use client";

import AccountSettings from "@/presentation/student/Settings";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import React from "react";

const Settings = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return (
		<div>
			<AccountSettings />
		</div>
	);
};

export default Settings;
