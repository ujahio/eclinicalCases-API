"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import useGetActiveCase from "@/services/hooks/useGetActiveCase";

const DoctorDashboardPage = dynamic(
	() => import("@/presentation/teacher/Dashboard"),
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
