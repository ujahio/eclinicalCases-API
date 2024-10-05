import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
	getDraftCases,
	resetGetDraftCasesStatus,
} from "@/store/slices/case/getDraftCasesSlice";

const useGetDraftCases = () => {
	const getDraftCasesState = useAppSelector((state) => state.getDraftCases);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(getDraftCases());
	}, []);

	useEffect(() => {
		if (getDraftCasesState.status === "succeeded") {
			dispatch(resetGetDraftCasesStatus());
		}
	}, [getDraftCasesState.status, dispatch]);

	return null;
};

export default useGetDraftCases;
