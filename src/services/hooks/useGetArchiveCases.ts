import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getArchiveCases,
	resetGetArchiveCasesStatus,
} from "@/store/slices/case/getArchiveCasesSlice";

const useGetArchiveCases = (filterParam?: string) => {
	const dispatch = useAppDispatch();
	const allCasesState = useAppSelector((state) => state.getArchiveCases);

	const handleGetAllCases = () => {
		if (filterParam) {
			dispatch(getArchiveCases(filterParam));
		}
	};

	useEffect(() => {
		handleGetAllCases();
	}, [dispatch, filterParam]);

	useEffect(() => {
		if (allCasesState.status === "succeeded") {
			dispatch(resetGetArchiveCasesStatus());
		}
	}, [allCasesState.status, dispatch]);

	return {
		allCasesState,
		handleGetAllCases,
	};
};

export default useGetArchiveCases;
