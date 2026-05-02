import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { getPublishedCase } from "@/store/slices/case/getPublishedCaseSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const useGetActiveCase = () => {
	const { session } = useAuthRedirect();
	const activeCaseState = useAppSelector((state) => state.activeCase);
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (session?.accessToken && activeCaseState.status === "idle") {
			dispatch(getPublishedCase());
		}
	}, [session?.accessToken, activeCaseState.status, dispatch]);

	return null;
};

export default useGetActiveCase;
