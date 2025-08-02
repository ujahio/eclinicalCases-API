"use client";
import { useEffect, useState } from "react";
import { Plate, usePlateEditor } from "platejs/react";
import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";

interface EditorConvertToJSONProps {
	content: string | undefined; // JSON string representing editor content
}

export function ReadOnlyEditor({ content }: EditorConvertToJSONProps) {
	const [parsedContent, setParsedContent] = useState<any[]>([]);
	const [contentReady, setContentReady] = useState(false);

	// Parse content when it changes
	useEffect(() => {
		if (!content) {
			// Set default empty content
			setParsedContent([{ type: "paragraph", children: [{ text: "" }] }]);
			setContentReady(true);
			return;
		}

		try {
			// Handle both string JSON and objects (if content is already an object)
			const contentValue =
				typeof content === "string" ? JSON.parse(content) : content;

			setParsedContent(Array.isArray(contentValue) ? contentValue : []);
			setContentReady(true);
		} catch (error) {
			console.error("Error parsing editor content:", error);
			// Set default content on error
			setParsedContent([{ type: "paragraph", children: [{ text: "" }] }]);
			setContentReady(true);
		}
	}, [content]);

	const editor = usePlateEditor({
		plugins: BasicNodesKit,
		id: "rich-text-editor",
		value: parsedContent,
	});

	// Update editor when content changes
	useEffect(() => {
		if (contentReady && editor && parsedContent.length > 0) {
			// Only update if the content is different to avoid cursor jumping
			const currentValue = editor.children;
			const contentStr = JSON.stringify(parsedContent);
			const currentStr = JSON.stringify(currentValue);

			if (contentStr !== currentStr) {
				editor.children = parsedContent;
			}
		}
	}, [parsedContent, editor, contentReady]);

	if (!contentReady) {
		return <div>Loading editor...</div>;
	}

	return (
		<>
			<Plate editor={editor}>
				<EditorContainer>
					<Editor variant="demo" placeholder="Type..." />
				</EditorContainer>
			</Plate>
		</>
	);
}
