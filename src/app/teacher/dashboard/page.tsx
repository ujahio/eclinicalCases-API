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

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboard />;
};

export default Page;
