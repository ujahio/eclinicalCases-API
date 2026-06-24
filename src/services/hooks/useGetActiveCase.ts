import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "./hooks";
import { getPublishedCase } from "@/store/slices/case/getPublishedCaseSlice";
import { useAuthRedirect } from "./useAuthRedirect";
import { checkPaymentStatus } from "@/services/apis/payment";

const useGetActiveCase = () => {
	const { session } = useAuthRedirect();
	const dispatch = useAppDispatch();
	const hasFetchedRef = useRef(false);
	const [hasStudentPaid, setHasStudentPaid] = useState<boolean | null>(null);

	useEffect(() => {
		checkPaymentStatus()
			.then((res) =>
				setHasStudentPaid(res.data?.hasActiveSubscription ?? false),
			)
			.catch(() => setHasStudentPaid(false));
		return () => {
			hasFetchedRef.current = false;
		};
	}, []);

	useEffect(() => {
		const isAllowedToGetPublishedCase =
			(session?.user.user_role === "student" &&
				session?.accessToken &&
				hasStudentPaid &&
				!hasFetchedRef.current) ||
			(session?.user.user_role === "teacher" &&
				session?.accessToken &&
				!hasFetchedRef.current);
		if (isAllowedToGetPublishedCase) {
			hasFetchedRef.current = true;
			dispatch(getPublishedCase());
		}
	}, [dispatch, session?.accessToken, hasStudentPaid]);

	return { hasStudentPaid };
};

export default useGetActiveCase;
