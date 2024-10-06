"use client";
import React from "react";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";
import dynamic from "next/dynamic";

const DoctorDashboardPage = dynamic(
	() => import("@/presentation/doctor/Dashboard"),
	{
		ssr: false,
	}
);
const Page = () => {
	useGetActiveCase();
	useGetArchiveCases("recent");

	return <DoctorDashboardPage />;
};

export default Page;
