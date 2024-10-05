"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import {
	deleteCase,
	resetDeleteCaseStatus,
} from "@/store/slices/case/deleteCaseSlice";
import useGetDraftCases from "@/services/hooks/useGetDraftCases";
import { getDraftCases } from "@/store/slices/case/getDraftCasesSlice";

const DoctorCaseStudies = dynamic(
	() => import("@/presentation/doctor/CaseStudies"),
	{
		ssr: false,
	}
);

const Page = () => {
	const deleteCaseState = useAppSelector((state) => state.deleteCase);
	const dispatch = useAppDispatch();

	useGetDraftCases();
	// need to retrieve archived cases

	const handleDeleteCase = (caseId: string) => {
		dispatch(deleteCase(caseId));
	};
	const { handleGetAllCases } = useGetArchiveCases();
	useEffect(() => {
		if (deleteCaseState.status === "succeeded") {
			dispatch(resetDeleteCaseStatus());
			// handleGetAllCases();

			// remove the case from the list of draft cases in state
			dispatch(getDraftCases());
		}
	}, [deleteCaseState.status, dispatch]);
	return <DoctorCaseStudies handleDeleteCase={handleDeleteCase} />;
};

export default Page;
