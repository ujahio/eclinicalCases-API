"use client";

import CreateCaseStudy from "@/presentation/doctor/CreateCaseStudy";
import React, { useEffect, useState } from "react";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import { createCaseStudyTabs } from "@/services/constants";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { addCase, resetAddCaseStatus } from "@/store/slices/case/addCaseSlice";
import { useRouter } from "next/navigation";

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

const Create = () => {
  const navigate = useRouter();
  const dispatch = useAppDispatch();
  const addCaseState = useAppSelector((state) => state.addCase);
  const [caseStudy, setCaseStudy] = useState(initialCaseStudy);
  const { active: activeTab, switchTab, isActive } = useProcessTabs(createCaseStudyTabs, 0);
  const [progress, setProgress] = useState(1);

  const goNext = () => {
    const next = activeTab + 1;
    switchTab(next);
    setProgress(next);
  };
  const handleAddCase = (draft = false) => {
    setCaseStudy({ ...caseStudy, draft: draft });
    dispatch(addCase({ ...caseStudy, draft }));
  };
  useEffect(() => {
    if (addCaseState.status === "succeeded") {
      dispatch(resetAddCaseStatus());
      navigate.push("/doctor/dashboard");
    }
  }, [addCaseState.status, dispatch]);
  return (
    <CreateCaseStudy
      activeTab={activeTab}
      switchTab={switchTab}
      goNext={goNext}
      progress={progress}
      isActive={isActive}
      caseStudy={caseStudy}
      setCaseStudy={setCaseStudy}
      handleAddCase={handleAddCase}
    />
  );
};

export default Create;
