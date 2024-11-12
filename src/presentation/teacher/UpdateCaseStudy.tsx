import React, { FunctionComponent } from "react";
import {
	DoctorCMEQuestions,
	DoctorCaseAnswer,
	DoctorCasePresentation,
	TeacherCaseTeaching,
} from "@/components/cases";
import FinalReview from "@/components/cases/teacher/final-review";
import AdminLayout from "@/components/layouts/dashboard/admin";
import ProcessTabs from "@/components/ui/process-tabs";
import { createCaseStudyTabs } from "@/services/constants";
import { APP_CONTAINER, APP_SPACING } from "@/services/constants/styles";
import { UpdateCaseStudyProps } from "@/services/types/teacher/createCaseStudy";

const UpdateCaseStudy: FunctionComponent<UpdateCaseStudyProps> = ({
	activeTab,
	switchTab,
	goNext,
	goBack,
	progress,
	isActive,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
	handlePublishCase,
}) => {
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
				</nav>
			}
		>
			<div className="mx-auto w-full max-w-3xl bg-white py-10 px-6 sm:p-8.75 md:p-10 border border-grey-border rounded-sm">
				{isActive("case_model_presentation") && (
					<DoctorCasePresentation
						goNext={goNext}
						caseStudy={caseStudy}
						setCaseStudy={setCaseStudy}
						handleUpdateDraftCase={handleUpdateDraftCase}
					/>
				)}

				{isActive("case_model_answer") && (
					<DoctorCaseAnswer
						goNext={goNext}
						goBack={goBack}
						caseStudy={caseStudy}
						setCaseStudy={setCaseStudy}
						handleUpdateDraftCase={handleUpdateDraftCase}
					/>
				)}

				{isActive("case_teaching") && (
					<TeacherCaseTeaching
						goNext={goNext}
						goBack={goBack}
						caseStudy={caseStudy}
						setCaseStudy={setCaseStudy}
						handleUpdateDraftCase={handleUpdateDraftCase}
					/>
				)}

				{isActive("cme_questions") && (
					<DoctorCMEQuestions
						goNext={goNext}
						goBack={goBack}
						caseStudy={caseStudy}
						setCaseStudy={setCaseStudy}
						handleUpdateDraftCase={handleUpdateDraftCase}
					/>
				)}
				{isActive("final_review") && (
					<FinalReview
						caseStudy={caseStudy}
						handleUpdateDraftCase={handleUpdateDraftCase}
						handlePublishCase={handlePublishCase}
					/>
				)}
			</div>
		</AdminLayout>
	);
};

export default UpdateCaseStudy;
