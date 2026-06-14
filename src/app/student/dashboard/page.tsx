"use client";

import StudentDashboard from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { Session } from "@/types/auth";

const StudentDashboardWithAuth = ({ session }: { session: Session }) => {
	useGetActiveCase({ session });
	useGetStudentsResponsesToCases({ session, filterParam: "recent" });

	return <StudentDashboard />;
};

const Page = () => {
	const { session } = useAuthRedirect();

	if (!session) {
		return null;
	}

	return <StudentDashboardWithAuth session={session} />;
};

export default Page;
