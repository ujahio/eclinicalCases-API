"use client";

import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import dynamic from "next/dynamic";

const TeacherDashboardComp = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
	{
		ssr: false,
	}
);

const TeacherDashboard = () => {
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboardComp />;
};

export default TeacherDashboard;
