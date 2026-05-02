import { FC, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import CaseEditor from "@/lib/Editor";
import {
	validateEditorInputs,
	ValidationErrorProps,
} from "@/services/helper/validateEditorInputs";
import ActionButtons from "@/components/ActionButtons";

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
	const [isEditorMounted, setIsEditorMounted] = useState(false);

	const [inputsForValidation, setErrorsForValidatedInputs] =
		useState<ValidationErrorProps>({
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

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

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<div className="mt-5">
					<h6 className="text-1sm sm:text-sm capitalize sm:mb-2 text-blue font-bold">
						COMMENT ON THE CASE
					</h6>
					<p className="text-1xs">
						{"Note: Comments must be between 150 and 700 characters."}
					</p>

					{isEditorMounted && (
						<CaseEditor
							content={studentCaseExplanation}
							onContentChange={handleEditorChange}
							status={inputsForValidation.explanation.status}
							validationMessage={
								inputsForValidation.explanation.validationMessage
							}
						/>
					)}
				</div>
			</div>
			<ActionButtons goNext={handleSubmitStudentResponse} goBack={goBack} />
		</>
	);
};

export default StudentCaseComments;
