import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks";
import { getPublishedCase } from "@/store/slices/case/getPublishedCaseSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const useGetActiveCase = () => {
	const { session } = useAuthRedirect();
	const dispatch = useAppDispatch();
	const hasFetchedRef = useRef(false);
	useEffect(() => {
		if (session?.accessToken && !hasFetchedRef.current) {
			hasFetchedRef.current = true;
			dispatch(getPublishedCase());
		}
	}, [dispatch, session?.accessToken]);
	useEffect(() => {
		return () => {
			hasFetchedRef.current = false;
		};
	}, []);
	return null;
};

export default useGetActiveCase;
