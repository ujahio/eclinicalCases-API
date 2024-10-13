"use client";

import React from "react";
import StudentDashboardComp from "@/presentation/student/Dashboard";
import useGetStudentsResponsesToCases from "@/services/hooks/useGetStudentsResponsesToCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";

const StudentDashboard = () => {
	useGetActiveCase();
	useGetStudentsResponsesToCases("recent"); // need to find out if we should be retrieving the same type of archived cases for students

	return <StudentDashboardComp />;
};

export default StudentDashboard;
