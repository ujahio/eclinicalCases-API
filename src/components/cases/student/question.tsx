import React, { FunctionComponent, useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";

interface StudentCaseQuestionProps {
	goNext: () => void;
	goBack: () => void;
	studentCaseTopicResponse: string;
	studentCaseExplanation: string;
	setCaseDetails: (details: any) => void;
}

export type QuestionErrorProps = {
	topic: {
		status: "error" | "valid";
		validationMessage?: string;
	};
	explanation: {
		status: "error" | "valid";
		validationMessage?: string;
	};
};

const StudentCaseQuestion: FunctionComponent<StudentCaseQuestionProps> = ({
	goNext,
	goBack,
	setCaseDetails,
	studentCaseTopicResponse,
	studentCaseExplanation,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);

	const [editorState, setEditorState] = useState(() =>
		studentCaseExplanation
			? EditorState.createWithContent(
					convertFromRaw(JSON.parse(studentCaseExplanation))
			  )
			: EditorState.createEmpty()
	);

	const [inputsForValidation, setErrorsForValidatedInputs] =
		useState<QuestionErrorProps>({
			topic: {
				status: "valid",
				validationMessage: "",
			},
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const onEditorStateChange = (newEditorState: EditorState) => {
		setEditorState(newEditorState);
		const contentState = newEditorState.getCurrentContent();
		const contentStateJSON = convertToRaw(contentState);
		setCaseDetails((prevDetails: any) => ({
			...prevDetails,
			studentCaseExplanation: JSON.stringify(contentStateJSON),
		}));
	};

	const handleSubmitStudentResponse = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault();
		const contentState = editorState.getCurrentContent().getPlainText().trim();
		const wordsArray = contentState
			.split(/\s+/)
			.filter((word) => word.length > 0);

		const editorTextContentCount = wordsArray.length;

		const validateEditorTextContent: boolean = studentCaseQuestionValidation(
			// questionDetails,
			setErrorsForValidatedInputs,
			editorTextContentCount
		);

		if (!validateEditorTextContent) {
			return;
		}

		goNext();
	};

	const handleStudentCaseTopicInput = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { value } = e.target;
		setCaseDetails((prevDetails: any) => ({
			...prevDetails,
			studentCaseTopicResponse: value,
		}));
	};

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model QUESTION
				</h6>
				<InputField
					value={studentCaseTopicResponse}
					onChange={handleStudentCaseTopicInput}
					placeholder="Guess case model topic"
					label="What is the topic for this case based on the case description given earlier?"
					name="caseModelTopicGuess"
					// error={inputsForValidation.topic.validationMessage}
				/>

				<div className="mt-5">
					<div className="text-grey-300 text-1sm capitalize font-normal">
						Give Further Explanation For Your Answer
					</div>
					{isEditorMounted && (
						<Editor
							editorState={editorState}
							onEditorStateChange={onEditorStateChange}
							editorStyle={{
								height: "400px",
								border:
									inputsForValidation.explanation.status === "error"
										? "1px solid red"
										: "solid 1px #E7EBEF",
								padding: "0px 15px",
							}}
						/>
					)}
					{inputsForValidation.explanation.status === "error" && (
						<p className="mt-0.625 font-light text-xxs text-red">
							{inputsForValidation.explanation.validationMessage}
						</p>
					)}
				</div>
			</div>
			<div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					Case Presentation
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

export default StudentCaseQuestion;

const topicMinLength = 5;
const explanationMinLength = 10;
const explanationMaxWordCount = 700;

const studentCaseQuestionValidation = (
	setError: Dispatch<SetStateAction<QuestionErrorProps>>,
	editorTextContentCount: number
): boolean => {
	let validated = true;

	if (editorTextContentCount < explanationMinLength) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Explanation must be at least ${explanationMinLength} characters!`,
			},
		}));
		validated = false;
	} else if (editorTextContentCount > explanationMaxWordCount) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Explanation cannot be more ${explanationMaxWordCount} characters!`,
			},
		}));
		validated = false;
	} else {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		}));
		validated = true;
	}
	return validated;
};
