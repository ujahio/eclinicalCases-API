import React, {
	FunctionComponent,
	useEffect,
	useState,
	Dispatch,
	SetStateAction,
} from "react";

import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useAppSelector } from "@/services/hooks/hooks";
import {
	DoctorCaseAnswerProps,
	CasePresentationErrorProps,
} from "@/services/types/doctor/createCaseStudy";

const DoctorCaseAnswer: FunctionComponent<DoctorCaseAnswerProps> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleUpdateDraftCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);
	const [inputsForValidation, setErrorsForValidatedInputs] =
		useState<CasePresentationErrorProps>({
			explanation: {
				status: "valid",
				validationMessage: "",
			},
		});

	const [editorState, setEditorState] = useState(() => {
		if (caseStudy?.caseExplanation) {
			try {
				// Try to parse the caseExplanation if it exists and is valid JSON
				const parsedExplanation = JSON.parse(caseStudy.caseExplanation);
				return EditorState.createWithContent(convertFromRaw(parsedExplanation));
			} catch (error) {
				console.error("Invalid caseExplanation JSON:", error);
				// In case of an invalid JSON, initialize an empty editor state
				return EditorState.createEmpty();
			}
		} else {
			// If caseExplanation is not defined, initialize an empty editor state
			return EditorState.createEmpty();
		}
	});
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const onEditorStateChange = (newEditorState: EditorState) => {
		setEditorState(newEditorState);
		const contentState = newEditorState.getCurrentContent();
		const contentStateJSON = convertToRaw(contentState);
		setCaseStudy({
			...caseStudy,
			caseExplanation: JSON.stringify(contentStateJSON),
		});
	};

	const handleAddCaseModelAnswer = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const contentState = editorState.getCurrentContent().getPlainText().trim();
		const wordsArray = contentState
			.split(/\s+/)
			.filter((word) => word.length > 0);

		const editorTextContentCount = wordsArray.length;

		const validateEditorTextContent: boolean = teacherCasePrentationValidation(
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
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model Answer
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
							marginTop: "1rem",
						}}
					/>
				)}
				{inputsForValidation.explanation.status === "error" && (
					<p className="mt-0.625 font-light text-red">
						{inputsForValidation.explanation.validationMessage}
					</p>
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
				<Button
					btnStyle="basic"
					size="lg"
					centralize
					onClick={handleAddCaseModelAnswer}
				>
					PROCEED TO CASE TEACHING
				</Button>
			</div>
		</>
	);
};

export default DoctorCaseAnswer;

const explanationMinLength = 10;
const explanationMaxWordCount = 700;

const teacherCasePrentationValidation = (
	setError: Dispatch<SetStateAction<CasePresentationErrorProps>>,
	editorTextContentCount: number
): boolean => {
	let validated = true;

	if (editorTextContentCount < explanationMinLength) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Case Model Answer cannot be less than ${explanationMinLength} words.`,
			},
		}));
		validated = false;
	} else if (editorTextContentCount > explanationMaxWordCount) {
		setError((prevState) => ({
			...prevState,
			explanation: {
				status: "error",
				validationMessage: `Case Model Answer cannot be more than ${explanationMaxWordCount} words!`,
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
