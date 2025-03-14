"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import {
	deleteCase,
	resetDeleteCaseStatus,
} from "@/store/slices/case/deleteCaseSlice";
import useGetDraftCases from "@/services/hooks/useGetDraftCase";
import {
	getDraftCases,
	resetGetDraftCasesStatus,
} from "@/store/slices/case/getDraftCasesSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { resetGetArchiveCasesStatus } from "@/store/slices/case/getArchiveCasesSlice";

const TeacherCaseStudies = dynamic(
	() => import("@/presentation/teacher/CaseStudies"),
	{
		ssr: false,
	}
);
const TeacherCaseStudiesContent = () => {
	const deleteCaseState = useAppSelector((state) => state.deleteCase);
	const dispatch = useAppDispatch();

	useGetDraftCases();
	useGetArchiveCases();

	const handleDeleteCase = (caseId: string) => {
		dispatch(deleteCase(caseId));
	};

	useEffect(() => {
		if (deleteCaseState.status === "succeeded") {
			dispatch(resetDeleteCaseStatus());
			dispatch(getDraftCases());
		}
	}, [deleteCaseState.status, dispatch]);

	useEffect(() => {
		return () => {
			dispatch(resetGetDraftCasesStatus());
			dispatch(resetGetArchiveCasesStatus());
		};
	}, [dispatch]);
	return <TeacherCaseStudies handleDeleteCase={handleDeleteCase} />;
};

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return <TeacherCaseStudiesContent />;
};

export default Page;
