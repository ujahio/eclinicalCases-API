"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetArchiveCases from "@/services/hooks/useGetArchiveCases";
import {
	deleteCase,
	resetDeleteCaseStatus,
} from "@/store/slices/case/deleteCaseSlice";
import useGetDraftCase from "@/services/hooks/useGetDraftCase";
import {
	getDraftCases,
	resetGetDraftCasesStatus,
} from "@/store/slices/case/getDraftCasesSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { resetGetArchiveCasesStatus } from "@/store/slices/case/getArchiveCasesSlice";
import TeacherCaseStudies from "@/presentation/teacher/CaseStudies";

const Page = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}
	return <TeacherCaseStudiesContent />;
};

const TeacherCaseStudiesContent = () => {
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

	useEffect(() => {
		return () => {
			dispatch(resetGetDraftCasesStatus());
			dispatch(resetGetArchiveCasesStatus());
		};
	}, [dispatch]);
	return <TeacherCaseStudies handleDeleteCase={handleDeleteCase} />;
};

export default Page;
