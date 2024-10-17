import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
	getPublishedCase,
	resetOngoingCaseStatus,
} from "@/store/slices/case/getPublishedCaseSlice";

const useGetActiveCase = () => {
	const activeCaseState = useAppSelector((state) => state.activeCase);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(getPublishedCase());
	}, [dispatch]);

	useEffect(() => {
		if (activeCaseState.status === "succeeded") {
			dispatch(resetOngoingCaseStatus());
		}
	}, [activeCaseState.status, dispatch]);

	return null;
};

export default useGetActiveCase;
