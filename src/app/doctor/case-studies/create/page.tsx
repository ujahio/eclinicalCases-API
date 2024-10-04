"use client";
import React, { useEffect, useState } from "react";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { addCase, resetAddCaseStatus } from "@/store/slices/case/addCaseSlice";
import { useRouter } from "next/navigation";
import { CaseStudy } from "@/services/types/doctor/createCaseStudy";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";

const CreateCaseStudy = dynamic(
	() => import("@/presentation/doctor/CreateCaseStudy"),
	{
		ssr: false,
	}
);

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
	draft: false,
	caseMaterials: [],
};

const Create = () => {
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
	const handleAddCase = (draft = false) => {
		setCaseStudy({ ...caseStudy, draft: draft });
		dispatch(addCase({ ...caseStudy, draft }));
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
		}
	}, [addCaseState.status, dispatch]);
	return (
		<CreateCaseStudy
			activeTab={activeTab}
			switchTab={switchTab}
			goNext={goNext}
			progress={progress}
			isActive={isActive}
			caseStudy={caseStudy}
			setCaseStudy={setCaseStudy}
			handleAddCase={handleAddCase}
		/>
	);
};

export default Create;
