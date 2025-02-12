"use client";

import React, { use, useEffect, useState } from "react";
import {
	fetchCaseData,
	resetCaseDataStatus,
} from "@/store/slices/case/getCaseDataSlice";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";
import ResponsesAndFeedbackPage from "@/presentation/teacher/ResponsesAndFeedback";

const ResponsesAndFeedbackContent = ({ params }: { params: any }) => {
	const [studentInfo, setStudent] = useState({});
	const dispatch = useAppDispatch();
	const caseDataState = useAppSelector((state) => state.getCaseData);

	const caseFeedbackAndResponsesInfo =
		caseDataState.caseData.responsesAndFeedbackInfo;
	const caseInformationForDisplay = caseDataState.caseData.caseInfo;

	const paramsToUse: {
		id: string;
	} = use(params);

	useEffect(() => {
		if (caseDataState.status === "succeeded") {
			dispatch(resetCaseDataStatus());
		}
	}, [caseDataState.status, dispatch]);

	useEffect(() => {
		const caseId = paramsToUse.id;
		if (caseId) {
			dispatch(fetchCaseData(caseId));
		}
	}, [paramsToUse, dispatch]);

	return (
		<ResponsesAndFeedbackPage
			studentInfo={studentInfo}
			setStudent={setStudent}
			caseFeedbackAndResponsesInfo={caseFeedbackAndResponsesInfo}
			caseInformationForDisplay={caseInformationForDisplay}
		/>
	);
};

const Page = ({ params }: any) => {
	const { session } = useAuthRedirect();
	if (!session) {
		return null;
	}

	return <ResponsesAndFeedbackContent params={params} />;
};

export default Page;
