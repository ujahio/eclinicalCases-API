import { InputField } from "@/components/form-elements";
import Button from "@/components/ui/Button";
import React, { FunctionComponent, useEffect, useState } from "react";
import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useAppSelector } from "@/services/hooks/hooks";
import { DoctorCaseQuestionProps } from "@/services/types/doctor/createCaseStudy";
import { toast } from "react-toastify";

const DoctorCaseQuestion: FunctionComponent<DoctorCaseQuestionProps> = ({
	goNext,
	caseStudy,
	setCaseStudy,
	handleAddCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	const [editorState, setEditorState] = useState(EditorState.createEmpty());

	useEffect(() => {
		if (caseStudy?.caseDescription) {
			console.log("caseStudy?.caseDescription", caseStudy?.caseDescription);
			const parsedDescription =
				typeof caseStudy.caseDescription === "string"
					? JSON.parse(caseStudy.caseDescription)
					: caseStudy.caseDescription;

			setEditorState(
				EditorState.createWithContent(convertFromRaw(parsedDescription))
			);
			setIsInitialized(true);
		}
	}, [caseStudy?.caseDescription, isInitialized]);

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

	console.log("addingDraftCaseStatus", addingDraftCaseStatus);

	const onEditorStateChange = (newEditorState: EditorState) => {
		setEditorState(newEditorState);
		const contentState = newEditorState.getCurrentContent();
		const contentStateJSON = convertToRaw(contentState);
		setCaseStudy({
			...caseStudy,
			caseDescription: JSON.stringify(contentStateJSON),
		});
	};

	return (
		<>
			<div className="mb-5 sm:mb-6">
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					Case Model Setup
				</h6>
				<InputField
					placeholder="Case model clue"
					label="Case model clue"
					name="caseClue"
					value={caseStudy?.caseClue}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						e.preventDefault();
						const { value } = e.target;
						setCaseStudy({ ...caseStudy, caseClue: value });
					}}
				/>

				<div className="mt-5">
					<label className="text-grey-300 text-1sm capitalize font-normal">
						Case Model Description
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

			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
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
				<Button
					btnStyle="basic"
					size="lg"
					className="text-xs"
					centralize
					onClick={() => goNext()}
				>
					PROCEED TO CASE MODEL ANSWER SETUP
				</Button>
			</div>
		</>
	);
};

export default DoctorCaseQuestion;
