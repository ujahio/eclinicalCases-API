import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getArchiveCases,
	resetGetArchiveCasesStatus,
} from "@/store/slices/case/getArchiveCasesSlice";

const useGetArchiveCases = (filterParam?: string) => {
	const dispatch = useAppDispatch();
	const archivedCasesState = useAppSelector((state) => state.getArchiveCases);

	useEffect(() => {
		dispatch(getArchiveCases(filterParam));
	}, [dispatch, filterParam]);

	useEffect(() => {
		if (archivedCasesState.status === "succeeded") {
			dispatch(resetGetArchiveCasesStatus());
		}
	}, [archivedCasesState.status, dispatch]);
};

export default useGetArchiveCases;
