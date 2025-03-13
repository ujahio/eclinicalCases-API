"use client";

import React, { FunctionComponent, useEffect, useState, use } from "react";
import UpdateCaseStudy from "@/presentation/teacher/UpdateCaseStudy";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetDraftCase from "@/services/hooks/useGetDraftCase";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import {
	resetGetDraftCasesStatus,
	updateDraftCase,
} from "@/store/slices/case/updateDraftCaseSlice";
import { addCase, resetAddCaseStatus } from "@/store/slices/case/addCaseSlice";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import { CaseStudy } from "@/services/types/teacher/createCaseStudy";

const getDraftCaseById = (caseId: string) => {
	const draftCases = useAppSelector((state) => state.getDraftCases.cases);
	const selectedDraftCase = draftCases.filter(
		(draftCase) => draftCase.id === caseId
	)[0];

	let caseQuestions = selectedDraftCase?.caseQuestions;
	if (
		selectedDraftCase?.caseQuestions &&
		typeof selectedDraftCase.caseQuestions === "string"
	) {
		caseQuestions = JSON.parse(selectedDraftCase.caseQuestions);
	}
	const updatedCaseStudy = {
		...selectedDraftCase,
		caseQuestions,
		shouldPublish: false,
	};

	return updatedCaseStudy;
};

const UpdateCaseStudyContent: FunctionComponent = () => {
	const navigate = useRouter();
	let { id: caseId }: { id: string } = useParams();

	const dispatch = useAppDispatch();
	const addCaseState = useAppSelector((state) => state.addCase);

	const {
		active: activeTab,
		switchTab,
		isActive,
	} = useProcessTabs(createCaseStudyTabs, 0);
	const [progress, setProgress] = useState(1);
	const [caseStudy, setCaseStudy] = useState<
		CaseStudy & { shouldPublish?: boolean; caseId?: string }
	>(getDraftCaseById(caseId));

	const goNext = () => {
		const next = activeTab + 1;
		switchTab(next);
		setProgress(next);
	};

	const goBack = () => {
		const next = activeTab - 1;
		switchTab(next);
		setProgress(next);
	};
	const handleUpdateDraftCase = () => {
		setCaseStudy(caseStudy);
		dispatch(updateDraftCase(caseStudy));
	};

	const handlePublishCase = () => {
		setCaseStudy({ ...caseStudy, shouldPublish: true, caseId });
		dispatch(addCase({ ...caseStudy, shouldPublish: true, caseId }));
	};

	useEffect(() => {
		if (addCaseState.status === "succeeded") {
			dispatch(resetAddCaseStatus());
			toast.success(addCaseState.newCase.message, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			navigate.push("/teacher/dashboard");
		} else if (addCaseState.status === "failed") {
			toast.error(addCaseState.error.message.message, {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
		}
	}, [addCaseState, dispatch, navigate]);

	return (
		<UpdateCaseStudy
			activeTab={activeTab}
			switchTab={switchTab}
			goNext={goNext}
			goBack={goBack}
			progress={progress}
			isActive={isActive}
			caseStudy={caseStudy}
			setCaseStudy={setCaseStudy}
			handleUpdateDraftCase={handleUpdateDraftCase}
			handlePublishCase={handlePublishCase}
		/>
	);
};

const Page: FunctionComponent = () => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}

	return <UpdateCaseStudyContent />;
};

export default Page;
