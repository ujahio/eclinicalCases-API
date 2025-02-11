"use client";

import AdminAccountSettings from "@/presentation/teacher/settings";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import React from "react";

const Settings = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return (
		<div>
			<AdminAccountSettings />
		</div>
	);
};

export default Settings;
