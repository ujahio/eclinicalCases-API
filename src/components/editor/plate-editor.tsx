"use client";

import { useEffect } from "react";
import { Plate, usePlateEditor } from "platejs/react";
import { cn } from "@/lib/utils";
import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Value } from "platejs";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar"; // Generic toolbar button

interface EditorConvertToJSONProps {
	content: string | undefined; // JSON string representing editor content
	onContentChange: (updatedContent: string) => void; // Callback for content updates
	status?: "valid" | "error"; // Validation status of the editor content
	validationMessage?: string; // Validation message for the editor content
	onEditorReady?: (editor: any) => void; // Add this prop to expose the editor
}

export function PlateEditor({
	content,
	onContentChange,
	status = "valid",
	validationMessage = "",
	onEditorReady,
}: EditorConvertToJSONProps) {
	const editor = usePlateEditor({
		plugins: BasicNodesKit,
		id: "rich-text-editor",
	});

	useEffect(() => {
		if (editor && onEditorReady) {
			onEditorReady(editor);
		}
	}, [editor, onEditorReady]);

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
		<>
			<div className={cn(status === "error" && "border-red-500")}>
				<Plate
					editor={editor}
					onValueChange={({ value }: { value: Value }) => {
						onContentChange(JSON.stringify(value));
					}}
				>
					<FixedToolbar className="justify-start rounded-t-lg">
						{/* Element Toolbar Buttons */}
						<ToolbarButton onClick={() => editor.tf.h1.toggle()}>
							H1
						</ToolbarButton>
						<ToolbarButton onClick={() => editor.tf.h2.toggle()}>
							H2
						</ToolbarButton>
						<ToolbarButton onClick={() => editor.tf.h3.toggle()}>
							H3
						</ToolbarButton>
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
				{status === "error" && (
					<p className="mt-0.625 font-light text-red">{validationMessage}</p>
				)}
			</div>
		</>
	);
}
