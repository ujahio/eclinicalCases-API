"use client";

import React from "react";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import TeacherDashboardPage from "@/presentation/teacher/Dashboard";

const Page = () => {
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <TeacherDashboardPage />;
};

export default Page;
