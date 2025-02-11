"use client";

import React from "react";
import StudentDashboardComp from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const StudentDashboard = () => {
	const { session } = useAuthRedirect();

	useGetActiveCase();
	useGetStudentsResponsesToCases("recent"); // need to find out if we should be retrieving the same type of archived cases for students
	if (!session) {
		return null;
	}
	return <StudentDashboardComp />;
};

export default StudentDashboard;
