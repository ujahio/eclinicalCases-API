import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
	getActiveCase,
	resetOngoingCaseStatus,
} from "@/store/slices/case/getActiveCaseSlice";

const useGetActiveCase = () => {
	const activeCaseState = useAppSelector((state) => state.activeCase);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(getActiveCase());
	}, []);

	useEffect(() => {
		if (activeCaseState.status === "succeeded") {
			dispatch(resetOngoingCaseStatus());
		}
	}, [activeCaseState.status, dispatch]);

	return null;
};

export default useGetActiveCase;
