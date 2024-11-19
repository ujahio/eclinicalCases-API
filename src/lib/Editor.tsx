import React, { FunctionComponent, useEffect, useState } from "react";
import {
	EditorState,
	convertFromRaw,
	convertToRaw,
	ContentState,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";

interface EditorConvertToJSONProps {
	content: string | undefined; // JSON string representing editor content
	onContentChange: (updatedContent: string) => void; // Callback for content updates
	status?: "valid" | "error"; // Validation status of the editor content
	validationMessage?: string; // Validation message for the editor content
}

const CaseEditor: FunctionComponent<EditorConvertToJSONProps> = ({
	content,
	onContentChange,
	status = "valid",
	validationMessage = "",
}) => {
	// Function to initialize the editor state from content or default to an empty string
	const initializeEditorState = (content: string | undefined): EditorState => {
		if (content) {
			try {
				const parsedContent = JSON.parse(content);
				return EditorState.createWithContent(convertFromRaw(parsedContent));
			} catch (error) {
				console.error("Invalid content JSON:", error);
			}
		}
		return EditorState.createWithContent(ContentState.createFromText(""));
	};

	// State for the editor and tracking the last emitted content
	const [editorState, setEditorState] = useState(() =>
		initializeEditorState(content)
	);
	const [currentContent, setCurrentContent] = useState(content);

	// Reinitialize editor state when content prop changes
	useEffect(() => {
		if (content !== currentContent) {
			setEditorState(initializeEditorState(content));
			setCurrentContent(content);
		}
	}, [content, currentContent]);

	// Handle editor state changes
	const onEditorStateChange = (newEditorState: EditorState) => {
		setEditorState(newEditorState);

		// Emit updated content back to parent
		const contentState = newEditorState.getCurrentContent();
		const contentStateJSON = JSON.stringify(convertToRaw(contentState));

		// Update only if content has changed
		if (contentStateJSON !== currentContent) {
			setCurrentContent(contentStateJSON);
			onContentChange(contentStateJSON);
		}
	};

	return (
		<>
			<Editor
				editorState={editorState}
				onEditorStateChange={onEditorStateChange}
				editorStyle={{
					height: "400px",
					border: status === "error" ? "1px solid red" : "solid 1px #E7EBEF",
					padding: "0px 15px",
				}}
			/>
			{status === "error" && (
				<p className="mt-0.625 font-light text-red">{validationMessage}</p>
			)}
		</>
	);
};

export default CaseEditor;
