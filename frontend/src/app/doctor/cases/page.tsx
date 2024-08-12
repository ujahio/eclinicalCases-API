"use client";

import DoctorCaseStudies from "@/presentation/doctor/CaseStudies";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useAllCases from "@/services/hooks/useAllCases";
import { deleteCase, resetDeleteCaseStatus } from "@/store/slices/case/deleteCaseSlice";
import React, { useEffect } from "react";

const Page = () => {
  const deleteCaseState = useAppSelector((state) => state.deleteCase);
  const dispatch = useAppDispatch();

  const handleDeleteCase = (caseId: string) => {
    dispatch(deleteCase(caseId));
  };
  const { handleGetAllCases } = useAllCases("all");
  useEffect(() => {
    if (deleteCaseState.status === "succeeded") {
      dispatch(resetDeleteCaseStatus());
      handleGetAllCases();
    }
  }, [deleteCaseState.status, dispatch]);
  return <DoctorCaseStudies handleDeleteCase={handleDeleteCase} />;
};

export default Page;
