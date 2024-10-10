"use client";

import React, { FunctionComponent, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
	fetchCaseData,
	resetCaseDataStatus,
} from "@/store/slices/case/getCaseDataSlice";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";

const ResponsesAndFeedbackPage = dynamic(
	() => import("@/presentation/doctor/ResponsesAndFeedback"),
	{
		ssr: false,
	}
);

const Page = ({ params }: any) => {
	const [studentInfo, setStudent] = useState({});
	const dispatch = useAppDispatch();
	const caseDataState = useAppSelector((state) => state.getCaseData);

	const caseFeedbackAndResponsesInfo =
		caseDataState.caseData.responsesAndFeedbackInfo;
	const caseInformationForDisplay = caseDataState.caseData.caseInfo;

	useEffect(() => {
		if (caseDataState.status === "succeeded") {
			dispatch(resetCaseDataStatus());
		}
	}, [caseDataState.status, dispatch]);

	useEffect(() => {
		const caseId = params.id;
		if (caseId) {
			dispatch(fetchCaseData(caseId));
		}
	}, [params.id]);

	return (
		<ResponsesAndFeedbackPage
			studentInfo={studentInfo}
			setStudent={setStudent}
			caseFeedbackAndResponsesInfo={caseFeedbackAndResponsesInfo}
			caseInformationForDisplay={caseInformationForDisplay}
		/>
	);
};

export default Page;
