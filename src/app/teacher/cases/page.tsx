"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import {
	deleteCase,
	resetDeleteCaseStatus,
} from "@/store/slices/case/deleteCaseSlice";
import useGetDraftCase from "@/services/hooks/useGetDraftCase";
import { getDraftCases } from "@/store/slices/case/getDraftCasesSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const TeacherCaseStudies = dynamic(
	() => import("@/presentation/teacher/CaseStudies"),
	{
		ssr: false,
	}
);

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	const deleteCaseState = useAppSelector((state) => state.deleteCase);
	const dispatch = useAppDispatch();

	useGetDraftCase();
	useGetArchiveCases();

	const handleDeleteCase = (caseId: string) => {
		dispatch(deleteCase(caseId));
	};

	useEffect(() => {
		if (deleteCaseState.status === "succeeded") {
			dispatch(resetDeleteCaseStatus());
			dispatch(getDraftCases("")); // ugly fix for type error
		}
	}, [deleteCaseState.status, dispatch]);
	return <TeacherCaseStudies handleDeleteCase={handleDeleteCase} />;
};

export default Page;
