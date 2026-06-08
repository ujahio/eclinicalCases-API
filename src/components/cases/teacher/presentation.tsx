import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseQuestionProps } from "@/services/types/teacher/createCaseStudy";
import CaseEditor from "@/lib/Editor";

const TeacherCasePresentation: FC<TeacherCaseQuestionProps> = ({
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
		(state) => state.getDraftCases.status,
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
				<h6 className="text-blue font-bold text-1xs sm:text-sm capitalize mb-3 create-case-heading">
					CASE MODEL PRESENTATION
				</h6>
				{isEditorMounted && (
					<CaseEditor
						content={caseStudy.caseDescription}
						onContentChange={handleEditorChange}
					/>
				)}
			</div>
			<div className="create-case-actions grid md:grid-cols-2 gap-4 items-center">
				<Button
					btnStyle="outline"
					centralize
					onClick={handleUpdateDraftCase}
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
				>
					{addingDraftCaseStatus === "loading" ? "Loading..." : "SAVE DRAFT"}
				</Button>
				<Button
					btnStyle="basic"
					className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
					centralize
					onClick={goNext}
				>
					<span>PROCEED</span>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M9 6l6 6-6 6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</Button>
			</div>
		</>
	);
};

export default TeacherCasePresentation;
