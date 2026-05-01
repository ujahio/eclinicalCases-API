import { FC, useState } from "react";
import Button from "@/components/ui/Button";
import { convertFromRaw, Editor, EditorState } from "draft-js";

interface StudentCaseAnswerProps {
	goNext: () => void;
	goBack: (() => void) | undefined;
	caseExplanation: any;
	studentCaseExplanation: string;
}

const StudentCaseAnswer: FC<StudentCaseAnswerProps> = ({
	goNext,
	goBack,
	caseExplanation,
	studentCaseExplanation,
}) => {
	const [compareMode, setCompareMode] = useState<boolean>(false);

	const teacherCaseStudyExplanationRawContent = caseExplanation
		? JSON.parse(caseExplanation)
		: { blocks: [], entityMap: {} };
	const studentCaseResponseRawContent = studentCaseExplanation
		? JSON.parse(studentCaseExplanation)
		: { blocks: [], entityMap: {} };

	const teacherCaseDescription = EditorState.createWithContent(
		convertFromRaw(teacherCaseStudyExplanationRawContent),
	);
	const studentCaseExplanationContent = EditorState.createWithContent(
		convertFromRaw(studentCaseResponseRawContent),
	);

	return (
		<>
			<div className="flex items-center justify-end mb-4">
				<Button
					btnStyle="outline"
					size="sm"
					centralize
					className="mb-2.5"
					onClick={() => setCompareMode(!compareMode)}
				>
					{compareMode ? "Hide Your Answer" : "View Your Answer"}
				</Button>
			</div>

			{!compareMode && (
				<div className="mb-5 sm:mb-6">
					<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mr-3.75 mb-2.5">
						CASE MODEL ANSWER
					</h6>
					<div className="text-dark sm:text-base text-1sm">
						<div className="mb-9 bg-gray-200 p-2.5">
							<Editor
								editorState={teacherCaseDescription}
								readOnly={true}
								onChange={() => {}}
							/>
						</div>
					</div>
				</div>
			)}

			{compareMode && (
				<div className="flex flex-col md:justify-between md:flex-row">
					<div className="md:w-45%">
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							YOUR RESPONSE
						</h6>
						<div className="mb-5 sm:mb-6">
							<div className="text-dark sm:text-base text-1sm">
								<div className="mb-9 bg-gray-200 p-2.5">
									<Editor
										editorState={studentCaseExplanationContent}
										readOnly={true}
										onChange={() => {}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Teacher's model answer */}
					<div className="md:w-45%">
						<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
							CASE MODEL ANSWER
						</h6>
						<div className="mb-5 sm:mb-6">
							<div className="text-dark sm:text-base text-1sm">
								<div className="mb-9 bg-gray-200 p-2.5">
									<Editor
										editorState={teacherCaseDescription}
										readOnly={true}
										onChange={() => {}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					BACK TO COMMENTS
				</Button>
				<Button btnStyle="basic" size="lg" centralize onClick={goNext}>
					PROCEED TO CASE TEACHING
				</Button>
			</div>
		</>
	);
};

export default StudentCaseAnswer;
