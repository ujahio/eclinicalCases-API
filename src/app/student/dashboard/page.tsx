"use client";

import StudentDashboard from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const Page = () => {
	const { session } = useAuthRedirect();

	if (!session) {
		return null;
	}

	useGetActiveCase();
	useGetStudentsResponsesToCases("recent");

	return <StudentDashboard />;
};

export default Page;
