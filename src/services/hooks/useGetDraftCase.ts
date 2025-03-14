import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getDraftCases } from "@/store/slices/case/getDraftCasesSlice";
import { useAuthRedirect } from "./useAuthRedirect";

const useGetDraftCases = (caseId?: string) => {
	const { session } = useAuthRedirect();

	const getDraftCasesState = useAppSelector((state) => state.getDraftCases);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (session?.accessToken && getDraftCasesState.status === "idle") {
			dispatch(getDraftCases());
		}
	}, [session, caseId, getDraftCasesState.status, dispatch]);

	return null;
};

export default useGetDraftCases;
