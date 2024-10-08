import React, { FunctionComponent, useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";

interface StudentCaseQuestionProps {
	goNext: () => void;
	goBack: () => void;
	caseDetails: {
		caseTopicAnswer: string;
		caseExplanation: string;
	};
	setCaseDetails: (details: any) => void;
}

const StudentCaseQuestion: FunctionComponent<StudentCaseQuestionProps> = ({
	goNext,
	goBack,
	caseDetails,
	setCaseDetails,
}) => {
	const [editorState, setEditorState] = useState(() =>
		caseDetails.caseExplanation
			? EditorState.createWithContent(
					convertFromRaw(JSON.parse(caseDetails.caseExplanation))
			  )
			: EditorState.createEmpty()
	);

	useEffect(() => {
		const contentState = editorState.getCurrentContent();
		const contentStateJSON = convertToRaw(contentState);
		setCaseDetails((prevDetails: any) => ({
			...prevDetails,
			caseExplanation: JSON.stringify(contentStateJSON),
		}));
	}, [editorState, setCaseDetails]);

	const onEditorStateChange = (newEditorState: EditorState) => {
		setEditorState(newEditorState);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setCaseDetails((prevDetails: any) => ({
			...prevDetails,
			caseTopicAnswer: value,
		}));
	};

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model QUESTION
				</h6>
				<InputField
					value={caseDetails.caseTopicAnswer}
					onChange={handleInputChange}
					placeholder="Guess case model topic"
					label="What is the topic for this case based on the topic clue given earlier?"
					name="caseModelTopicGuess"
					// error={inputsForValidation.topic.validationMessage}
				/>

				<div className="mt-5">
					<div className="text-grey-300 text-1sm capitalize font-normal">
						Give Further Explanation For Your Answer
					</div>
					{/* {inputsForValidation.explanation.status === "error" && (
            <p className="mt-0.625 font-light text-xxs text-red">{inputsForValidation.explanation.validationMessage}</p>
          )} */}
					<Editor
						editorState={editorState}
						onEditorStateChange={onEditorStateChange}
						editorStyle={{
							height: "400px",
							border: "solid 1px #E7EBEF",
							padding: "0px 15px",
						}}
					/>
				</div>
			</div>
			<div className="grid sm:grid-cols-1 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					Case Presentation
				</Button>
				<Button btnStyle="basic" size="lg" centralize onClick={goNext}>
					Submit
				</Button>
			</div>
		</>
	);
};

export default StudentCaseQuestion;
