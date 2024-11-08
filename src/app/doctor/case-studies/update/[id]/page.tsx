"use client";

import React, { FunctionComponent, useEffect, useState, use } from "react";
import UpdateCaseStudy from "@/presentation/doctor/UpdateCaseStudy";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useGetDraftCase from "@/services/hooks/useGetDraftCase";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { CaseStudy } from "@/services/types/doctor/createCaseStudy";
import {
	resetGetDraftCasesStatus,
	updateDraftCase,
} from "@/store/slices/case/updateDraftCaseSlice";
import { addCase, resetAddCaseStatus } from "@/store/slices/case/addCaseSlice";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// TODO: move to a utility file/folder
const formatDateToYYYYMMDD = (dateString: any) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const Update: FunctionComponent<any> = ({ params }) => {
	const navigate = useRouter();

	const dispatch = useAppDispatch();
	const getDraftCasesState = useAppSelector((state) => state.getDraftCases);
	const addCaseState = useAppSelector((state) => state.addCase);

	const {
		active: activeTab,
		switchTab,
		isActive,
	} = useProcessTabs(createCaseStudyTabs, 0);
	const [progress, setProgress] = useState(1);
	const [caseStudy, setCaseStudy] = useState(getDraftCasesState.cases[0]);

	const paramsToUse: {
		id: string;
	} = use(params);

	useGetDraftCase(paramsToUse.id);

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
		const draftCaseInfo = {
			...caseStudy,
			shouldPublish: false,
			_id: paramsToUse.id,
		};
		setCaseStudy(draftCaseInfo);
		dispatch(updateDraftCase(draftCaseInfo));
	};

	const handlePublishCase = () => {
		setCaseStudy({ ...caseStudy, shouldPublish: true, caseId: paramsToUse.id });
		dispatch(
			addCase({ ...caseStudy, shouldPublish: true, caseId: paramsToUse.id })
		);
	};

	useEffect(() => {
		if (getDraftCasesState.status === "succeeded") {
			dispatch(resetGetDraftCasesStatus());
			const draftCaseDetails = getDraftCasesState.cases[0];

			const updatedCaseStudy = {
				caseClue: draftCaseDetails.caseClue || "",
				caseDescription: draftCaseDetails.caseDescription,
				caseTopic: draftCaseDetails.caseTopic || "",
				caseExplanation: draftCaseDetails.caseExplanation,
				caseDeadline: draftCaseDetails.caseDeadline
					? formatDateToYYYYMMDD(draftCaseDetails.caseDeadline)
					: "",
				caseQuestions: draftCaseDetails.caseQuestions
					? draftCaseDetails.caseQuestions
					: [],
				caseStatus: draftCaseDetails.caseStatus,
				caseMaterials: draftCaseDetails.caseMaterials
					? JSON.parse(draftCaseDetails?.caseMaterials)
					: [],
			};

			setCaseStudy(updatedCaseStudy);
		}
	}, [getDraftCasesState, dispatch]);

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
			navigate.push("/doctor/dashboard");
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

export default Update;
