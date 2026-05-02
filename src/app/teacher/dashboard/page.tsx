"use client";
import dynamic from "next/dynamic";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const TeacherDashboard = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
	{
		ssr: false,
	},
);

const TeacherDashboardContent = () => {
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboard />;
};

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return <TeacherDashboardContent />;
};

export default Page;
