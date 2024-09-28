"use client";
import React from "react";
import useAllCases from "@/services/hooks/useAllCases";
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
	useAllCases("recent");

	return <DoctorDashboardPage />;
};

export default Page;
