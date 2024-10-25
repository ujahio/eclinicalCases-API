import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, { FunctionComponent, useEffect, useState } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useAppSelector } from "@/services/hooks/hooks";
import { DoctorCaseAnswerProps } from "@/services/types/doctor/createCaseStudy";

const DoctorCaseAnswer: FunctionComponent<DoctorCaseAnswerProps> = ({
	goNext,
	goBack,
	caseStudy,
	setCaseStudy,
	handleAddCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);

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
	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model Answer Setup
				</h6>
				<InputField
					placeholder="Case model topic"
					label="Case Model Topic"
					name="caseTopic"
					value={caseStudy.caseTopic}
					onChange={(e) => {
						e.preventDefault();
						setCaseStudy({ ...caseStudy, caseTopic: e.target.value });
					}}
				/>

				<div className="mt-5">
					<label className="text-grey-300 text-1sm capitalize font-normal">
						Further Explanation
					</label>
					{isEditorMounted && (
						<Editor
							editorState={editorState}
							onEditorStateChange={onEditorStateChange}
							editorStyle={{
								height: "400px",
								border: "solid 1px #E7EBEF",
								padding: "0px 15px",
							}}
						/>
					)}
				</div>
			</div>
			<Button
				btnStyle="outline"
				size="lg"
				centralize
				onClick={handleAddCase}
				className="w-full mb-3"
			>
				{addingDraftCaseStatus === "loading"
					? "Loading..."
					: "Save As a Draft..."}
			</Button>

			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
				<Button btnStyle="outline" size="lg" centralize onClick={goBack}>
					GO BACK TO CASE MODEL SETUP
				</Button>
				<Button btnStyle="basic" size="lg" centralize onClick={goNext}>
					PROCEED TO MATERIALS AND DEADLINE
				</Button>
			</div>
		</>
	);
};

export default DoctorCaseAnswer;
