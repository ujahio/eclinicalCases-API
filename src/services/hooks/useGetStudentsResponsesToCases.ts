import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getStudentsResponsesToCases } from "@/store/slices/student/getStudentsResponsesToCasesSlice";
import { useAuthRedirect } from "@/services/hooks/useAuthRedirect";

const useGetStudentsResponsesToCases = (filterParam?: string) => {
	const { session } = useAuthRedirect();
	const dispatch = useAppDispatch();
	const studentsResponsesToCasesState = useAppSelector(
		(state) => state.studentsResponsesToCases
	);

	useEffect(() => {
		if (session?.token && studentsResponsesToCasesState.status === "idle") {
			dispatch(getStudentsResponsesToCases(filterParam));
		}
	}, [session, studentsResponsesToCasesState.status, dispatch, filterParam]);
};

export default useGetStudentsResponsesToCases;
