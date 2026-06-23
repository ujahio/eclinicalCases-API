"use client";

import { useState, useEffect } from "react";
import StudentDashboard from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { Session } from "@/types/auth";
import { checkSubscriptionStatus } from "@/services/apis/payment";

const StudentDashboardWithAuth = ({ session }: { session: Session }) => {
	const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);

	useGetActiveCase({ session });
	useGetStudentsResponsesToCases({ session, filterParam: "recent" });

	useEffect(() => {
		checkSubscriptionStatus()
			.then((res) => setHasSubscription(res.data?.hasActiveSubscription ?? false))
			.catch(() => setHasSubscription(false));
	}, []);

	return <StudentDashboard hasSubscription={hasSubscription} />;
};

const Page = () => {
	const { session } = useAuthRedirect();

	if (!session) {
		return null;
	}

	return <StudentDashboardWithAuth session={session} />;
};

export default Page;
