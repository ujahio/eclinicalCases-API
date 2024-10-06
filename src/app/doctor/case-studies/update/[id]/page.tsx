"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
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
import { addCase } from "@/store/slices/case/addCaseSlice";

const initialCaseStudy: CaseStudy = {
	caseClue: "",
	caseDescription: "",
	caseTopic: "",
	caseExplanation: "",
	caseDeadline: "",
	caseQuestions: [
		{
			question: "",
			options: [""],
			correctAnswer: 0,
		},
	],
	caseStatus: "draft",
	caseMaterials: [],
};

// TODO: move to a utility file/folder
const formatDateToYYYYMMDD = (dateString: any) => {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const Update = ({ params }: any) => {
	const dispatch = useAppDispatch();
	const navigate = useRouter();

	const getDraftCasesState = useAppSelector((state) => state.getDraftCases);
	const addCaseState = useAppSelector((state) => state.addCase);

	const {
		active: activeTab,
		switchTab,
		isActive,
	} = useProcessTabs(createCaseStudyTabs, 0);
	const [progress, setProgress] = useState(1);
	const [caseStudy, setCaseStudy] = useState(initialCaseStudy);
	const [prevCaseMaterials, setPrevCaseMaterials] = useState<File[]>([]);

	// get draft case for the case
	useGetDraftCase(params.id);

	const goNext = () => {
		const next = activeTab + 1;
		switchTab(next);
		setProgress(next);
	};

	const handleUpdateCase = () => {
		const updatedCaseData: any = caseStudy;
		// If no new materials are added, remove caseMaterials from the payload
		if (updatedCaseData.caseMaterials?.length === 0) {
			delete updatedCaseData.caseMaterials;
		}

		dispatch(updateDraftCase({ caseData: updatedCaseData, _id: params.id }));
	};

	const handlePublishCase = () => {
		setCaseStudy({ ...caseStudy, shouldPublish: true });
		dispatch(addCase({ ...caseStudy, shouldPublish: true }));
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
				caseMaterials: [],
			};

			setCaseStudy(updatedCaseStudy);
			setPrevCaseMaterials(draftCaseDetails.caseMaterials || []); // Set prevCaseMaterials

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
		}
	}, [getDraftCasesState.status, dispatch]);

	return (
		<UpdateCaseStudy
			activeTab={activeTab}
			switchTab={switchTab}
			goNext={goNext}
			progress={progress}
			isActive={isActive}
			caseStudy={caseStudy}
			setCaseStudy={setCaseStudy}
			prevCaseMaterials={prevCaseMaterials}
			setPrevCaseMaterials={setPrevCaseMaterials}
			handleUpdateCase={handleUpdateCase}
			handlePublishCase={handlePublishCase}
		/>
	);
};

export default Update;
