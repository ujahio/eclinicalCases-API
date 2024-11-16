import React, { FunctionComponent, useEffect, useState } from "react";
import Button from "@/components/ui/Button";

import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import { useAppSelector } from "@/services/hooks/hooks";
import { TeacherCaseQuestionProps } from "@/services/types/teacher/createCaseStudy";

const TeacherCasePresentation: FunctionComponent<TeacherCaseQuestionProps> = ({
	goNext,
	caseStudy,
	setCaseStudy,
	// handleUpdateDraftCase,
}) => {
	const [isEditorMounted, setIsEditorMounted] = useState(false);

	const [editorState, setEditorState] = useState(() => {
		if (caseStudy?.caseDescription) {
			try {
				const parsedDescription = JSON.parse(caseStudy.caseDescription);
				return EditorState.createWithContent(convertFromRaw(parsedDescription));
			} catch (error) {
				console.error("Invalid caseDescription JSON:", error);
				return EditorState.createEmpty();
			}
		} else {
			return EditorState.createEmpty();
		}
	});

	useEffect(() => {
		setIsEditorMounted(true);
	}, []);

	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status
	);

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
				<div className="">
					<h6 className="text-blue font-bold text-1xs sm:text-sm capitalize mb-3">
						CASE MODEL PRESENTATION
					</h6>

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
			{/* 
			<div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
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
				<Button
					btnStyle="basic"
					size="lg"
					className="text-xs"
					centralize
					onClick={goNext}
				>
					PROCEED TO CASE MODEL ANSWER
				</Button>
			</div> */}

			<div className="grid grid-cols-1 gap-4">
				<Button
					btnStyle="basic"
					size="lg"
					className="text-xs"
					centralize
					onClick={goNext}
				>
					PROCEED TO CASE MODEL ANSWER
				</Button>
			</div>
		</>
	);
};

export default TeacherCasePresentation;
