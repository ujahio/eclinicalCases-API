"use client";

import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import dynamic from "next/dynamic";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const TeacherDashboardComp = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
	{
		ssr: false,
	}
);

const TeacherDashboard = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboardComp />;
};

export default TeacherDashboard;
