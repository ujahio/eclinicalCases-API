"use client";

import React from "react";
import StudentDashboardComp from "@/presentation/student/Dashboard";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useOngoingCases from "@/services/hooks/useOngoingCases";
const StudentDashboard = () => {
	useOngoingCases();
	useGetArchiveCases("recent"); // need to find out if we should be retrieving the same type of archived cases for students
	return <StudentDashboardComp />;
};

export default StudentDashboard;
