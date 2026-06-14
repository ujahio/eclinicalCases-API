import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getStudentsResponsesToCases } from "@/store/slices/student/getStudentsResponsesToCasesSlice";
import { Session } from "@/types/auth";

const useGetStudentsResponsesToCases = ({
	session,
	filterParam,
}: {
	session: Session | null;
	filterParam: string;
}) => {
	const dispatch = useAppDispatch();

	const studentsResponsesToCasesState = useAppSelector(
		(state) => state.studentsResponsesToCases,
	);

	useEffect(() => {
		if (
			session?.accessToken &&
			studentsResponsesToCasesState.status === "idle"
		) {
			dispatch(getStudentsResponsesToCases(filterParam));
		}
	}, [
		session?.accessToken,
		studentsResponsesToCasesState.status,
		dispatch,
		filterParam,
	]);
};

export default useGetStudentsResponsesToCases;
