"use client";
import React, { useEffect, useState, FunctionComponent } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { addCase, resetAddCaseStatus } from "@/store/slices/case/addCaseSlice";
import { useRouter } from "next/navigation";
import { CaseStudy } from "@/services/types/doctor/createCaseStudy";

const CreateCaseStudy = dynamic(
	() => import("@/presentation/doctor/CreateCaseStudy"),
	{
		ssr: false,
	}
);

const initialCaseStudy: CaseStudy = {
	caseDescription: "",
	caseTopic: "",
	caseExplanation: "",
	caseDeadline: "",
	caseTeaching: "",
	caseQuestions: [
		{
			question: "",
			options: [],
			correctAnswer: 0,
		},
	],
	caseStatus: "draft",
	caseMaterials: [],
	shouldPublish: false,
};

const Create: FunctionComponent = () => {
	const navigate = useRouter();
	const dispatch = useAppDispatch();
	const addCaseState = useAppSelector((state) => state.addCase);
	const [caseStudy, setCaseStudy] = useState(initialCaseStudy);
	const {
		active: activeTab,
		switchTab,
		isActive,
	} = useProcessTabs(createCaseStudyTabs, 0);
	const [progress, setProgress] = useState(1);

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
		const draftCaseInfo = { ...caseStudy, shouldPublish: false };
		setCaseStudy(draftCaseInfo);
		dispatch(addCase(draftCaseInfo));
	};

	const handlePublishCase = () => {
		const publishedCaseInfo = { ...caseStudy, shouldPublish: true };
		setCaseStudy(publishedCaseInfo);
		dispatch(addCase(publishedCaseInfo));
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
		<CreateCaseStudy
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

export default Create;
