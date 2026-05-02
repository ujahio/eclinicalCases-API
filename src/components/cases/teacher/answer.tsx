import { FC, useEffect, useState } from "react";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseAnswerProps } from "@/services/types/teacher/createCaseStudy";
import CaseEditor from "@/lib/Editor";
import { formatDateToYYYYMMDD } from "@/utils/formatDate";
import ActionButtons from "@/components/ActionButtons";

const TeacherCaseAnswer: FC<TeacherCaseAnswerProps> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const handleEditorChange = (updatedContent: string) => {
		setCaseStudy({
			...caseStudy,
			caseExplanation: updatedContent,
		});
	};

	const caseDeadline = caseStudy?.caseDeadline
		? formatDateToYYYYMMDD(caseStudy.caseDeadline)
		: "";

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status,
	);

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5 create-case-heading">
					Case Model Answer
				</h6>

				{isEditorMounted && (
					<CaseEditor
						content={caseStudy.caseExplanation}
						onContentChange={handleEditorChange}
					/>
				)}
			</div>
			<div className="mb-5 sm:mb-6">
				<InputField
					placeholder=""
					label="Select a deadline for this case study"
					name="caseDeadline"
					type="date"
					value={caseDeadline}
					onChange={(e) => {
						const { value } = e.target;
						setCaseStudy({ ...caseStudy, caseDeadline: value });
					}}
				/>
			</div>
			<Button
				btnStyle="outline"
				centralize
				onClick={handleUpdateDraftCase}
				className="w-full mb-3 sm:text-sm cursor-pointer"
			>
				{addingDraftCaseStatus === "loading" ? "Loading..." : "SAVE DRAFT"}
			</Button>

			<ActionButtons goNext={goNext} goBack={goBack} />
		</>
	);
};

export default TeacherCaseAnswer;
