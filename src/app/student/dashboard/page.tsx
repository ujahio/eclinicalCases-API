"use client";

import React, { useEffect } from "react";
import StudentDashboard from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { resetOngoingCaseStatus } from "@/store/slices/case/getPublishedCaseSlice";
import { resetGetStudentsResponsesToCasesStatus } from "@/store/slices/student/getStudentsResponsesToCasesSlice";
import { useAppDispatch } from "@/services/hooks/hooks";

const StudentDashboardContent = () => {
	const dispatch = useAppDispatch();

	useGetActiveCase();
	useGetStudentsResponsesToCases("recent");

	useEffect(() => {
		return () => {
			dispatch(resetOngoingCaseStatus());
			dispatch(resetGetStudentsResponsesToCasesStatus());
		};
	}, [dispatch]);

	return <StudentDashboard />;
};

const Page = () => {
	const { session } = useAuthRedirect();

	if (!session) {
		return null;
	}

	return <StudentDashboardContent />;
};

export default Page;
