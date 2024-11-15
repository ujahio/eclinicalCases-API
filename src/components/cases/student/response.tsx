import React, {
	FunctionComponent,
	useEffect,
	useState,
	Dispatch,
	SetStateAction,
} from "react";
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import Button from "@/components/ui/Button";

interface StudentCaseQuestionProps {
	goNext: () => void;
	goBack: () => void;
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

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<div className="mt-5">
					<h6 className="text-1sm sm:text-sm capitalize sm:mb-2 text-blue font-bold">
						WHAT IS YOUR RESPONSE TO THE CASE PRESENTATION?
					</h6>
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
						<p className="mt-0.625 font-light text-red">
							{inputsForValidation.explanation.validationMessage}
						</p>
					)}
				</div>
			</div>
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
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

const studentCaseQuestionValidation = (
	setError: Dispatch<SetStateAction<QuestionErrorProps>>,
	editorTextContentCount: number
): boolean => {
	let validated = true;
	const explanationMaxWordCount = 700;
	if (editorTextContentCount === 0) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: "Explanation cannot be empty!",
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
