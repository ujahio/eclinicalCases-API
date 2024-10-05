"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useAllCases from "@/services/hooks/useAllCases";
import {
	deleteCase,
	resetDeleteCaseStatus,
} from "@/store/slices/case/deleteCaseSlice";
import useGetDraftCases from "@/services/hooks/useGetDraftCases";

const DoctorCaseStudies = dynamic(
	() => import("@/presentation/doctor/CaseStudies"),
	{
		ssr: false,
	}
);

const Page = () => {
	// const deleteCaseState = useAppSelector((state) => state.deleteCase);
	const dispatch = useAppDispatch();

	useGetDraftCases();

	const handleDeleteCase = (caseId: string) => {
		dispatch(deleteCase(caseId));
	};
	// const { handleGetAllCases } = useAllCases();
	// useEffect(() => {
	// 	if (deleteCaseState.status === "succeeded") {
	// 		dispatch(resetDeleteCaseStatus());
	// 		handleGetAllCases();
	// 	}
	// }, [deleteCaseState.status, dispatch]);
	return <DoctorCaseStudies handleDeleteCase={handleDeleteCase} />;
};

export default Page;
