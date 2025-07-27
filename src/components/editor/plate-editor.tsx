"use client";

import { Plate, usePlateEditor, createPlateEditor } from "platejs/react";

import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Value } from "platejs";
import { useEffect } from "react";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar"; // Generic toolbar button

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
			<FixedToolbar className="justify-start rounded-t-lg">
				{/* Element Toolbar Buttons */}
				<ToolbarButton onClick={() => editor.tf.h1.toggle()}>H1</ToolbarButton>
				<ToolbarButton onClick={() => editor.tf.h2.toggle()}>H2</ToolbarButton>
				<ToolbarButton onClick={() => editor.tf.h3.toggle()}>H3</ToolbarButton>
				<ToolbarButton onClick={() => editor.tf.blockquote.toggle()}>
					Quote
				</ToolbarButton>
				<MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
					B
				</MarkToolbarButton>
				<MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
					I
				</MarkToolbarButton>
				<MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
					U
				</MarkToolbarButton>
			</FixedToolbar>
			<EditorContainer>
				<Editor variant="demo" placeholder="Type..." />
			</EditorContainer>
		</Plate>
	);
}
