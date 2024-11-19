import React, { FunctionComponent, useEffect, useState } from "react";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseAnswerProps } from "@/services/types/teacher/createCaseStudy";
import CaseEditor from "@/lib/Editor";

const TeacherCaseAnswer: FunctionComponent<TeacherCaseAnswerProps> = ({
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

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model Answer
				</h6>

				{isEditorMounted && (
					<CaseEditor
						content={caseStudy?.caseExplanation}
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
					value={caseStudy.caseDeadline}
					onChange={(e) => {
						const { value } = e.target;
						setCaseStudy({ ...caseStudy, caseDeadline: value });
					}}
				/>
			</div>
			<Button
				btnStyle="outline"
				size="lg"
				centralize
				onClick={handleUpdateDraftCase}
				className="w-full mb-3"
			>
				{addingDraftCaseStatus === "loading"
					? "Loading..."
					: "Save As a Draft..."}
			</Button>

			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					GO BACK TO CASE MODEL
				</Button>
				<Button btnStyle="basic" size="lg" centralize onClick={goNext}>
					PROCEED TO CASE TEACHING
				</Button>
			</div>
		</>
	);
};

export default TeacherCaseAnswer;
