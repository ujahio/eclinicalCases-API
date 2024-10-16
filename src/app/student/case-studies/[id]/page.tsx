"use client";

import StudentCaseStudy from "@/presentation/student/CaseStudy";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	fetchCaseDetails,
	resetCaseDetailsStatus,
} from "@/store/slices/case/caseDetailsSlice";
import {
	resetSubmitCaseResponseStatus,
	submitCaseResponse,
} from "@/store/slices/student/SubmitCaseResponseSlice";
import React, { useEffect, useState } from "react";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { toast } from "react-toastify";
import { CaseDetail } from "@/services/types/student";

const tabs = [
	"Case Presentation",
	"Case Model Question",
	"Case Model Answers",
	"CME Questions",
	"Feedbacks",
	"Certificate",
];
const CaseStudies = ({ params }: any) => {
	const dispatch = useAppDispatch();
	const { active: activeTab, switchTab, isActive } = useProcessTabs(tabs, 0);
	const [progress, setProgress] = useState(1);
	const [caseDetails, setCaseDetails] = useState<CaseDetail>({
		caseID: params.id,
		caseTopicAnswer: "",
		caseExplanation: "",
		answers: [],
	});

	const caseDetailsState = useAppSelector((state) => state.caseDetails);
	const submitResponseState = useAppSelector(
		(state) => state.submitCaseResponse
	);

	const handleSubmitResponse = () => {
		dispatch(submitCaseResponse(caseDetails));
	};

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

	useEffect(() => {
		if (params.id) {
			dispatch(fetchCaseDetails(params.id));
		}
	}, [params.id, dispatch]);

	useEffect(() => {
		if (caseDetailsState.status === "succeeded") {
			dispatch(resetCaseDetailsStatus());
			const parsedQuestions =
				JSON.parse(caseDetailsState?.data.caseQuestions) || [];
			const updatedCaseDetails = {
				...caseDetails,
				answers: parsedQuestions.map((question: any) => ({
					question: question.question,
					options: question.options,
				})),
			};
			setCaseDetails(updatedCaseDetails);
		}
	}, [caseDetailsState.status, dispatch]);

	useEffect(() => {
		if (submitResponseState.status === "succeeded") {
			dispatch(resetSubmitCaseResponseStatus());
			// switchTab(5);
			// setProgress(5);
			if (!submitResponseState.response.passed) {
				toast.error(submitResponseState.response.messageToDisplay, {
					position: "top-right",
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
			} else {
				toast.success(submitResponseState.response.messageToDisplay, {
					position: "top-right",
					autoClose: 5000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
				switchTab(4);
				setProgress(4);
			}
		}
	}, [submitResponseState.status, dispatch]);

	return (
		<div>
			<StudentCaseStudy
				caseDetails={caseDetails}
				setCaseDetails={setCaseDetails}
				handleSubmitResponse={handleSubmitResponse}
				activeTab={activeTab}
				switchTab={switchTab}
				tabs={tabs}
				progress={progress}
				isActive={isActive}
				goNext={goNext}
				goBack={goBack}
			/>
		</div>
	);
};

export default CaseStudies;
