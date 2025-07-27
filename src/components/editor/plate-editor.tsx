"use client";

import { Plate, usePlateEditor, createPlateEditor } from "platejs/react";

import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Value } from "platejs";
import { useEffect } from "react";

interface EditorConvertToJSONProps {
	content: string | undefined; // JSON string representing editor content
	onContentChange: (updatedContent: string) => void; // Callback for content updates
	status?: "valid" | "error"; // Validation status of the editor content
	validationMessage?: string; // Validation message for the editor content
}

export function PlateEditor({
	content,
	onContentChange,
}: EditorConvertToJSONProps) {
	const editor = usePlateEditor({
		plugins: BasicNodesKit,
		id: "rich-text-editor",
	});

	// Update editor's value when content prop changes
	useEffect(() => {
		if (content && editor) {
			try {
				const contentValue = JSON.parse(content);
				// Only update if the content is different to avoid cursor jumping
				const currentValue = editor.children;
				const contentStr = JSON.stringify(contentValue);
				const currentStr = JSON.stringify(currentValue);

				if (contentStr !== currentStr) {
					editor.children = contentValue;
				}
			} catch (error) {
				console.error("Error parsing editor content:", error);
			}
		}
	}, [content, editor]);

	return (
		<Plate
			editor={editor}
			initialValue={content ? JSON.parse(content) : []}
			onValueChange={({ value }: { value: Value }) => {
				onContentChange(JSON.stringify(value));
			}}
		>
			<EditorContainer>
				<Editor variant="demo" placeholder="Type..." />
			</EditorContainer>
		</Plate>
	);
}
