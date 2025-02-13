import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getArchiveCases } from "@/store/slices/case/getArchiveCasesSlice";
import { useAuthRedirect } from "./useAuthRedirect";

const useGetArchiveCases = (filterParam?: string) => {
	const { session } = useAuthRedirect();
	const dispatch = useAppDispatch();

	const archivedCasesState = useAppSelector((state) => state.getArchiveCases);
	useEffect(() => {
		if (session?.accessToken && archivedCasesState.status === "idle") {
			dispatch(getArchiveCases(filterParam));
		}
	}, [session, dispatch, archivedCasesState.status, filterParam]);
};

export default useGetArchiveCases;
