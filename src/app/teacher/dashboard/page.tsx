"use client";

import dynamic from "next/dynamic";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";

const TeacherDashboardPage = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
	{
		ssr: false,
	}
);
const Page = () => {
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboardPage />;
};

export default Page;
