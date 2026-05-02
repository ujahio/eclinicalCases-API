import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getArchiveCases } from "@/store/slices/case/getArchiveCasesSlice";
import { Session } from "next-auth";

const useGetArchiveCases = ({
	session,
	filterParam,
}: {
	session: Session | null;
	filterParam: string;
}) => {
	const dispatch = useAppDispatch();

	const archivedCasesState = useAppSelector((state) => state.getArchiveCases);
	useEffect(() => {
		if (session?.accessToken && archivedCasesState.status === "idle") {
			dispatch(getArchiveCases(filterParam));
		}
	}, [session, dispatch, archivedCasesState.status, filterParam]);
};

export default useGetArchiveCases;
