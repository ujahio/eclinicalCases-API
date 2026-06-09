import { FC, useMemo, useState } from "react";
import CaseEditor from "@/lib/Editor";
import {
	validateEditorInputs,
	ValidationErrorProps,
} from "@/services/helper/validateEditorInputs";
import ProgressButtons from "@/components/progressButtons";

interface StudentCaseCommentsProps {
	goNext: () => void;
	goBack: () => void | undefined;
	studentCaseExplanation: string;
	setCaseDetails: (details: any) => void;
}

const StudentCaseComments: FC<StudentCaseCommentsProps> = ({
	goNext,
	goBack,
	setCaseDetails,
	studentCaseExplanation,
}) => {
	const [inputsForValidation, setErrorsForValidatedInputs] =
		useState<ValidationErrorProps>({
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});

	const handleSubmitStudentResponse = () => {
		const isValid = validateEditorInputs(
			setErrorsForValidatedInputs,
			studentCaseExplanation,
		);

		if (!isValid) return;

		goNext();
	};

	const handleEditorChange = (updatedContent: string) => {
		setCaseDetails((prevState: any) => ({
			...prevState,
			studentCaseExplanation: updatedContent,
		}));
	};

	const wordCount = useMemo(() => {
		const plainText = studentCaseExplanation
			? studentCaseExplanation.replace(/<[^>]*>/g, "").trim()
			: "";
		return plainText.split(/\s+/).filter((word) => word.length > 0).length;
	}, [studentCaseExplanation]);

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<div className="mt-5">
					<h6 className="text-1sm sm:text-sm capitalize sm:mb-2 text-blue font-bold">
						COMMENT ON THE CASE
					</h6>

					<CaseEditor
						content={studentCaseExplanation}
						onContentChange={handleEditorChange}
						status={inputsForValidation.explanation.status}
						validationMessage={
							inputsForValidation.explanation.validationMessage
						}
					/>
					<p
						className={`text-xs mt-1 text-right ${wordCount < 150 || wordCount > 700 ? "text-red" : "text-grey-300"}`}
					>
						{wordCount} / 700 words
						{inputsForValidation.explanation.status === "error" && (
							<span className="ml-2 text-red">
								· {inputsForValidation.explanation.validationMessage}
							</span>
						)}
					</p>
				</div>
			</div>
			<ProgressButtons goNext={handleSubmitStudentResponse} goBack={goBack} />
		</>
	);
};

export default StudentCaseComments;
