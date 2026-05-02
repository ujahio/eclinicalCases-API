import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/services/hooks/hooks";
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
	const hasFetchedRef = useRef(false);
	useEffect(() => {
		if (session?.accessToken && !hasFetchedRef.current) {
			hasFetchedRef.current = true;
			dispatch(getArchiveCases(filterParam));
		}
	}, [dispatch, session?.accessToken]);
	useEffect(() => {
		return () => {
			hasFetchedRef.current = false;
		};
	}, []);
	return null;
};

export default useGetArchiveCases;
