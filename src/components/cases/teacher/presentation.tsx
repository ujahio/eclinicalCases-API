import React, { FunctionComponent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseQuestionProps } from "@/services/types/teacher/createCaseStudy";
import CaseEditor from "@/lib/Editor";

const TeacherCasePresentation: FunctionComponent<TeacherCaseQuestionProps> = ({
	goNext,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

	const handleEditorChange = (updatedContent: string) => {
		setCaseStudy({
			...caseStudy,
			caseDescription: updatedContent,
		});
	};

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<div className="">
					<h6 className="text-blue font-bold text-1xs sm:text-sm capitalize mb-3">
						CASE MODEL PRESENTATION
					</h6>

					{isEditorMounted && (
						<CaseEditor
							content={caseStudy?.caseDescription}
							onContentChange={handleEditorChange}
						/>
					)}
				</div>
			</div>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
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
				<Button
					btnStyle="basic"
					size="lg"
					className="text-xs"
					centralize
					onClick={goNext}
				>
					PROCEED TO CASE MODEL ANSWER
				</Button>
			</div>
		</>
	);
};

export default TeacherCasePresentation;
