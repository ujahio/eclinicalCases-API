"use client";
import React from "react";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useOngoingCases from "@/services/hooks/useOngoingCases";
import dynamic from "next/dynamic";

const DoctorDashboardPage = dynamic(
	() => import("@/presentation/doctor/Dashboard"),
	{
		ssr: false,
	}
);
const Page = () => {
	useOngoingCases();
	useGetArchiveCases("recent");

	return <DoctorDashboardPage />;
};

export default Page;
