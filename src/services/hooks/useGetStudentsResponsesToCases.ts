import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import {
	getStudentsResponsesToCases,
	resetGetStudentsResponsesToCasesStatus,
} from "@/store/slices/student/getStudentsResponsesToCasesSlice";

const useGetStudentsResponsesToCases = (filterParam?: string) => {
	const dispatch = useAppDispatch();
	const studentsResponsesToCasesState = useAppSelector(
		(state) => state.studentsResponsesToCases
	);

	useEffect(() => {
		dispatch(getStudentsResponsesToCases(filterParam));
	}, [dispatch, filterParam]);

	useEffect(() => {
		if (studentsResponsesToCasesState.status === "succeeded") {
			dispatch(resetGetStudentsResponsesToCasesStatus());
		}
	}, [studentsResponsesToCasesState.status, dispatch]);
};

export default useGetStudentsResponsesToCases;
