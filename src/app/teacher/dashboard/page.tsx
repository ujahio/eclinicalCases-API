"use client";
import { useEffect } from "react";
import { useAppDispatch } from "@/services/hooks/hooks";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { resetOngoingCaseStatus } from "@/store/slices/case/getPublishedCaseSlice";
import { resetGetArchiveCasesStatus } from "@/store/slices/case/getArchiveCasesSlice";
import TeacherDashboard from "@/presentation/teacher/Dashboard";

const TeacherDashboardContent = () => {
	const { session } = useAuthRedirect();
	const dispatch = useAppDispatch();

	useGetActiveCase();
	useGetArchiveCases("recent");

	useEffect(() => {
		return () => {
			dispatch(resetOngoingCaseStatus());
			dispatch(resetGetArchiveCasesStatus());
		};
	}, [dispatch]);

	if (!session) {
		return null;
	}

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
