import { useEffect, useRef } from "react";
import { useAppDispatch } from "./hooks";
import { getPublishedCase } from "@/store/slices/case/getPublishedCaseSlice";
import { Session } from "@/types/auth";

const useGetActiveCase = ({ session }: { session: Session | null }) => {
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
