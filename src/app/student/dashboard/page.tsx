"use client";

import StudentDashboard from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";

const StudentDashboardWithAuth = () => {
	const { session } = useAuthRedirect();
	const { hasStudentPaid } = useGetActiveCase();

	useGetStudentsResponsesToCases({ session, filterParam: "recent" });

	return <StudentDashboard hasStudentPaid={hasStudentPaid} />;
};

const Page = () => {
	const { session } = useAuthRedirect();

	if (!session) {
		return null;
	}

	return <StudentDashboardWithAuth />;
};

export default Page;
