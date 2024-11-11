"use client";
import React, { useEffect, useState, use } from "react";
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
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { toast } from "react-toastify";
import { CaseDetail } from "@/services/types/student";

const tabs = [
	"Case Presentation",
	"Case Response",
	"Case Model Answers",
	"Case Teaching",
	"CME Questions",
	"Feedback",
	"Certificate",
];

const CaseStudies = ({ params }: { params: any }) => {
	const dispatch = useAppDispatch();
	const { active: activeTab, switchTab, isActive } = useProcessTabs(tabs, 0);
	const [progress, setProgress] = useState(5);
	const paramsToUse: {
		id: string;
	} = use(params);

	const caseDetailsState = useAppSelector((state) => state.caseDetails);
	const [caseDetails, setCaseDetails] = useState<CaseDetail>(
		caseDetailsState.data
	);

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
		if (paramsToUse.id) {
			dispatch(fetchCaseDetails(paramsToUse.id));
		}
	}, [paramsToUse, dispatch]);

	useEffect(() => {
		if (caseDetailsState.status === "succeeded") {
			dispatch(resetCaseDetailsStatus());
			const parsedQuestions =
				JSON.parse(caseDetailsState?.data.caseQuestions) || [];
			const updatedCaseDetails = {
				...caseDetailsState?.data,
				answers: parsedQuestions.map((question: any) => ({
					question: question.question,
					options: question.options,
				})),
				studentCaseExplanation: "",
				caseMaterials: JSON.parse(caseDetailsState?.data.caseMaterials),
			};
			setCaseDetails(updatedCaseDetails);
		}
	}, [caseDetailsState, dispatch]);

	useEffect(() => {
		if (submitResponseState.status === "succeeded") {
			dispatch(resetSubmitCaseResponseStatus());
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
	}, [submitResponseState, dispatch, switchTab]);
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
