import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { getAllCases, resetGetAllCasesStatus } from "@/store/slices/case/getAllCasesSlice";

const useAllCases = (filterParam?: string) => {
  const dispatch = useAppDispatch();
  const allCasesState = useAppSelector((state) => state.getAllCases);

  const handleGetAllCases = () => {
    if (filterParam) {
      dispatch(getAllCases(filterParam));
    }
  };

  useEffect(() => {
    handleGetAllCases();
  }, [dispatch, filterParam]);

  useEffect(() => {
    if (allCasesState.status === "succeeded") {
      dispatch(resetGetAllCasesStatus());
    }
  }, [allCasesState.status, dispatch]);

  return {
    allCasesState,
    handleGetAllCases,
  };
};

export default useAllCases;
