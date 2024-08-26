import React from "react";
import {
  DoctorCMEQuestions,
  DoctorCaseAnswer,
  DoctorCaseQuestion,
  DoctorMaterialsAndDeadlineForUpdate,
} from "@/components/cases";
import FinalReview from "@/components/cases/doctor/final-review";
import AdminLayout from "@/components/layouts/dashboard/admin";
import Button from "@/components/ui/Button";
import ProcessTabs from "@/components/ui/process-tabs";
import { createCaseStudyTabs } from "@/services/constants";
import { APP_CONTAINER, APP_SPACING } from "@/services/constants/styles";
import { UpdateCaseStudyProps } from "@/services/types/doctor/createCaseStudy";

const UpdateCaseStudy = ({
  activeTab,
  switchTab,
  goNext,
  progress,
  isActive,
  caseStudy,
  setCaseStudy,
  prevCaseMaterials,
  setPrevCaseMaterials,
  handleUpdateCase,
}: UpdateCaseStudyProps) => {
  return (
    <AdminLayout
      extraNav={
        <nav
          className={`bg-white h-17.5 flex items-center w-full border-t text-xxs border-grey-400 border-opacity-40 ${APP_SPACING} ${APP_CONTAINER}`}
        >
          <ProcessTabs
            active={activeTab}
            changeTab={switchTab}
            tabs={createCaseStudyTabs}
            canClickBackward
            canClickForward={false}
            progress={progress}
          />
          <Button size="sm" btnStyle="outline" className="ml-auto">
            View existing case studies
          </Button>
        </nav>
      }
    >
      <div className="mx-auto w-full max-w-3xl bg-white py-10 px-6 sm:p-8.75 md:p-10 border border-grey-border rounded-sm">
        {isActive("case_model_question_setup") && (
          <DoctorCaseQuestion goNext={goNext} caseStudy={caseStudy} setCaseStudy={setCaseStudy} />
        )}

        {isActive("case_model_answers_setup") && (
          <DoctorCaseAnswer goNext={goNext} caseStudy={caseStudy} setCaseStudy={setCaseStudy} />
        )}

        {isActive("materials_and_deadline") && (
          <DoctorMaterialsAndDeadlineForUpdate
            goNext={goNext}
            caseStudy={caseStudy}
            setCaseStudy={setCaseStudy}
            prevCaseMaterials={prevCaseMaterials}
            setPrevCaseMaterials={setPrevCaseMaterials}
          />
        )}

        {isActive("cme_questions") && (
          <DoctorCMEQuestions goNext={goNext} caseStudy={caseStudy} setCaseStudy={setCaseStudy} />
        )}
        {isActive("final_review") && (
          <FinalReview goNext={goNext} caseStudy={caseStudy} handleAddCase={handleUpdateCase} />
        )}
      </div>
    </AdminLayout>
  );
};

export default UpdateCaseStudy;
