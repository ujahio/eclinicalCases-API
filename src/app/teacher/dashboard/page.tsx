"use client";
import dynamic from "next/dynamic";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { Session } from "next-auth";

const TeacherDashboard = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
	{
		ssr: false,
	},
);

const TeacherDashboardWithAuth = ({ session }: { session: Session }) => {
	useGetActiveCase({ session });
	useGetArchiveCases({ session, filterParam: "recent" });
	return <TeacherDashboard />;
};

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}

	return <TeacherDashboardWithAuth session={session} />;
};

export default Page;
