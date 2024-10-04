import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
	fetchOngoingCases,
	resetOngoingCaseStatus,
} from "@/store/slices/case/onGoingCaseSlice";

const useOngoingCases = () => {
	const ongoingCasesState = useAppSelector((state) => state.onGoingCase);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchOngoingCases());
	}, []);

	useEffect(() => {
		if (ongoingCasesState.status === "succeeded") {
			dispatch(resetOngoingCaseStatus());
		}
	}, [ongoingCasesState.status, dispatch]);

	return null;
};

export default useOngoingCases;
