import React, { FunctionComponent, useRef, useState } from "react";
import Button from "@/components/ui-custom/button";
import {
	validateEditorContent,
	ValidationErrorProps,
} from "@/services/helper/validateEditorContent";
import { PlateEditor } from "@/components/editor/plate-editor";
import { TPlateEditor, useEditorString } from "platejs/react";

interface StudentCaseCommentsProps {
	goNext: () => void;
	goBack: (() => void) | undefined;
	studentCaseExplanation: string;
	setCaseDetails: (details: any) => void;
}

const StudentCaseComments: FunctionComponent<StudentCaseCommentsProps> = ({
	goNext,
	goBack,
	setCaseDetails,
	studentCaseExplanation,
}) => {
	const editorRef = useRef<any>(null);
	const editorContent = useEditorString();
	const [inputsForValidation, setErrorsForValidatedInputs] =
		useState<ValidationErrorProps>({
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});

	const handleEditorReady = (editor: TPlateEditor) => {
		editorRef.current = editor;
	};

	const handleSubmitStudentResponse = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault();
		const isValid = validateEditorContent(
			setErrorsForValidatedInputs,
			editorContent
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

					<PlateEditor
						content={studentCaseExplanation}
						onContentChange={handleEditorChange}
						validationMessage={
							inputsForValidation.explanation.validationMessage
						}
						status={inputsForValidation.explanation.status}
						onEditorReady={handleEditorReady}
					/>
				</div>
			</div>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					Back to Case Presentation
				</Button>
				<Button
					btnStyle="basic"
					size="lg"
					centralize
					onClick={handleSubmitStudentResponse}
				>
					Submit
				</Button>
			</div>
		</>
	);
};

export default StudentCaseComments;
