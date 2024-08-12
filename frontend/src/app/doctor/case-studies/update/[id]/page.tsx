"use client";

import UpdateCaseStudy from "@/presentation/doctor/UpdateCaseStudy";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { fetchCaseDetails, resetCaseDetailsStatus } from "@/store/slices/case/caseDetailsSlice";
import { resetUpdateCaseStatus, updateCase } from "@/store/slices/case/updateCaseSlice";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const initialCaseStudy = {
  caseClue: "",
  caseDescription: "",
  caseTopic: "",
  caseExplanation: "",
  caseDeadline: "",
  caseQuestions: [
    {
      question: "",
      options: [""],
      correctAnswer: 0,
    },
  ],
  draft: false,
  caseMaterials: [],
};

const formatDateToYYYYMMDD = (dateString: any) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Update = ({ params }: any) => {
  const navigate = useRouter();
  const dispatch = useAppDispatch();
  const caseDetailsState = useAppSelector((state) => state.caseDetails);
  const updateCaseState = useAppSelector((state) => state.updateCase);

  const { active: activeTab, switchTab, isActive } = useProcessTabs(createCaseStudyTabs, 0);
  const [progress, setProgress] = useState(1);
  const [caseStudy, setCaseStudy] = useState(initialCaseStudy);
  const [prevCaseMaterials, setPrevCaseMaterials] = useState<File[]>([]);

  const goNext = () => {
    const next = activeTab + 1;
    switchTab(next);
    setProgress(next);
  };

  const handleFetchCaseDetails = (caseId: any) => {
    dispatch(fetchCaseDetails(caseId));
  };

  const handleUpdateCase = (draft = false) => {
    const updatedCaseData: any = { ...caseStudy, draft };
    // If no new materials are added, remove caseMaterials from the payload
    if (updatedCaseData.caseMaterials.length === 0) {
      delete updatedCaseData.caseMaterials;
    }

    dispatch(updateCase({ caseData: updatedCaseData, _id: params.id }));
  };

  useEffect(() => {
    if (params.id) {
      handleFetchCaseDetails(params.id);
    }
  }, [params.id]);

  useEffect(() => {
    if (updateCaseState.status === "succeeded") {
      dispatch(resetUpdateCaseStatus());
      navigate.push("/doctor/dashboard");
    }
  }, [updateCaseState.status, dispatch]);

  useEffect(() => {
    if (caseDetailsState.status === "succeeded") {
      dispatch(resetCaseDetailsStatus());
      const caseDetails = caseDetailsState.caseDetails?.data;

      const updatedCaseStudy = {
        caseClue: caseDetails.caseClue || "",
        caseDescription: caseDetails.caseDescription,
        caseTopic: caseDetails.caseTopic || "",
        caseExplanation: caseDetails.caseExplanation,
        caseDeadline: caseDetails.caseDeadline ? formatDateToYYYYMMDD(caseDetails.caseDeadline) : "",
        caseQuestions: caseDetails.caseQuestions || [],
        draft: caseDetails.caseStatus === "draft",
        caseMaterials: [], // Initialize caseMaterials as an empty array
      };

      setCaseStudy(updatedCaseStudy);
      setPrevCaseMaterials(caseDetails.caseMaterials || []); // Set prevCaseMaterials
    }
  }, [caseDetailsState.status, dispatch]);

  return (
    <UpdateCaseStudy
      activeTab={activeTab}
      switchTab={switchTab}
      goNext={goNext}
      progress={progress}
      isActive={isActive}
      caseStudy={caseStudy}
      setCaseStudy={setCaseStudy}
      prevCaseMaterials={prevCaseMaterials}
      setPrevCaseMaterials={setPrevCaseMaterials}
      handleUpdateCase={handleUpdateCase}
    />
  );
};

export default Update;
