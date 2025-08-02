import React from "react";
import {
	StudentCaseAnswer,
	StudentCasePresentation,
	StudentCaseComments,
	StudentCertificate,
	StudentCMEQuestions,
	StudentFeedback,
	StudentCaseTeaching,
} from "@/components/cases";
import DashboardLayout from "@/components/layouts/dashboard";
import ProcessTabs from "@/components/ui/process-tabs";
import { APP_CONTAINER, APP_SPACING } from "@/services/constants/styles";
import { StudentCaseStudyProps } from "@/services/types/student";

const StudentCaseStudy = ({
	caseDetails,
	setCaseDetails,
	handleSubmitResponse,
	activeTab,
	switchTab,
	tabs,
	progress,
	isActive,
	goNext,
	goBack,
	hasPassedCME,
}: StudentCaseStudyProps) => {
	return (
		<DashboardLayout
			extraNav={
				<nav
					className={`bg-white h-17.5 flex items-center w-full border-t border-grey-400 border-opacity-40 ${APP_SPACING} ${APP_CONTAINER}`}
				>
					<ProcessTabs
						active={activeTab}
						changeTab={switchTab}
						tabs={tabs}
						canClickBackward
						canClickForward={false}
						progress={progress}
						hasPassedCME={hasPassedCME}
					/>
				</nav>
			}
		>
			<div className="mx-auto w-full max-w-3xl bg-white py-10 px-6 sm:p-8.75 md:p-10 border border-grey-border rounded-sm">
				{isActive("case_presentation") && (
					<StudentCasePresentation
						goNext={goNext}
						caseDescription={caseDetails?.caseDescription}
						caseDeadline={caseDetails?.caseDeadline}
					/>
				)}

				{isActive("case_comments") && (
					<StudentCaseComments
						goNext={goNext}
						goBack={goBack}
						studentCaseExplanation={caseDetails?.studentCaseExplanation}
						setCaseDetails={setCaseDetails}
					/>
				)}

				{isActive("case_model_answers") && (
					<StudentCaseAnswer
						goNext={goNext}
						goBack={goBack}
						studentCaseExplanation={caseDetails?.studentCaseExplanation}
						caseExplanation={caseDetails?.caseExplanation}
					/>
				)}

				{isActive("case_teaching") && (
					<StudentCaseTeaching
						goNext={goNext}
						goBack={goBack}
						caseTopic={caseDetails?.caseTopic}
						caseTeaching={caseDetails?.caseTeaching}
						caseMaterialsMetaData={caseDetails?.caseMaterials}
					/>
				)}

				{isActive("cme_questions") && (
					<StudentCMEQuestions
						goBack={goBack}
						caseDetails={caseDetails}
						setCaseDetails={setCaseDetails}
						handleSubmitResponse={handleSubmitResponse}
					/>
				)}

				{isActive("feedback") && <StudentFeedback goNext={goNext} />}

				{isActive("certificate") && <StudentCertificate />}
			</div>
		</DashboardLayout>
	);
};

export default StudentCaseStudy;
