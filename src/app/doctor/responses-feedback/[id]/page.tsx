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
	const [student, setStudent] = useState("");
	const dispatch = useAppDispatch();
	const caseDataState = useAppSelector((state) => state.getCaseData);
	console.log("caseDataState", caseDataState);

	const caseFeedbackAndResponsesInfo =
		caseDataState.caseData.responseItems || [];
	console.log("caseFeedbackAndResponsesInfo", caseFeedbackAndResponsesInfo);

	useEffect(() => {
		if (caseDataState.status === "succeeded") {
			dispatch(resetCaseDataStatus());
		}
	}, [caseDataState.status, dispatch]);
	// get caseId
	useEffect(() => {
		const caseId = params.id;
		if (caseId) {
			dispatch(fetchCaseData(caseId));
		}
	}, [params.id]);

	return (
		<ResponsesAndFeedbackPage
			student={student}
			setStudent={setStudent}
			caseFeedbackAndResponsesInfo={caseFeedbackAndResponsesInfo}
		/>
	);
};

export default Page;
