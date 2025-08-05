"use client";

import { useEffect } from "react";
import { Plate, usePlateEditor } from "platejs/react";
import { cn } from "@/lib/utils";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { Value } from "platejs";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { ToolbarButton } from "@/components/ui/toolbar"; // Generic toolbar button
// import {BlockToolbarButton } from "@/components/ui/block-toolbar-button"; // Block-specific toolbar button

import {
	UndoIcon,
	RedoIcon,
	EraserIcon,
	BoldIcon,
	ItalicIcon,
	UnderlineIcon,
	StrikethroughIcon,
	CodeIcon,
	HighlighterIcon,
	FontSizeIcon,
	ChevronDownIcon,
	AlignLeftIcon,
	AlignCenterIcon,
	AlignRightIcon,
	ListIcon,
	NumberListIcon,
	// ChecklistIcon,
	OutdentIcon,
	IndentIcon,
	QuoteIcon,
	LinkIcon,
	TableIcon,
	ClockIcon,
	ImageIcon,
	ListOrderedIcon,
} from "lucide-react"; // Use your icon library

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
		plugins: BaseEditorKit,
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
			<Plate
				editor={editor}
				onValueChange={({ value }: { value: Value }) => {
					onContentChange(JSON.stringify(value));
				}}
			>
				<FixedToolbar className="justify-start rounded-t-lg gap-1 p-1">
					{/* Undo/Redo */}
					<ToolbarButton onClick={() => editor.undo()}>
						<UndoIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.redo()}>
						<RedoIcon className="w-4 h-4" />
					</ToolbarButton>
					{/* Clear formatting */}
					<ToolbarButton>
						<EraserIcon className="w-4 h-4" />
					</ToolbarButton>
					{/* Font size controls */}
					<div className="flex items-center gap-1 px-2">
						{/* <FontSizeIcon className="w-4 h-4" /> */}
						<span>Text</span>
						<ChevronDownIcon className="w-3 h-3" />
						<ToolbarButton onClick={() => editor.tf.fontSize.addMark("16")}>
							-
						</ToolbarButton>
						<span>16</span>
						<ToolbarButton onClick={() => editor.increaseFontSize()}>
							+
						</ToolbarButton>
					</div>
					<ToolbarButton onClick={() => editor.tf.h1.toggle()}>
						H1
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.tf.h2.toggle()}>
						H2
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.tf.h3.toggle()}>
						H3
					</ToolbarButton>
					{/* Bold, Italic, Underline, Strikethrough */}
					<MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
						<BoldIcon className="w-4 h-4" />
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
						<ItalicIcon className="w-4 h-4" />
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
						<UnderlineIcon className="w-4 h-4" />
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="strikethrough" tooltip="Strikethrough">
						<StrikethroughIcon className="w-4 h-4" />
					</MarkToolbarButton>
					{/* Code, Highlight, Color */}
					<MarkToolbarButton nodeType="code" tooltip="Code">
						<CodeIcon className="w-4 h-4" />
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="highlight" tooltip="Highlight">
						<HighlighterIcon className="w-4 h-4" />
					</MarkToolbarButton>
					{/* TODO: Add color pickers as needed */}
					{/* Alignment */}
					<ToolbarButton onClick={() => editor.tf.align("left")}>
						<AlignLeftIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.align("center")}>
						<AlignCenterIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.align("right")}>
						<AlignRightIcon className="w-4 h-4" />
					</ToolbarButton>
					{/* Lists */}
					<ToolbarButton type="button">
						<ListIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton type="button">
						<ListOrderedIcon className="w-4 h-4" />
					</ToolbarButton>

					{/* Indent/Outdent */}
					<ToolbarButton onClick={() => editor.outdent()}>
						<OutdentIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.indent()}>
						<IndentIcon className="w-4 h-4" />
					</ToolbarButton>
					<ToolbarButton type="button">
						<QuoteIcon
							className="w-4 h-4"
							onClick={() => editor.tf.blockquote.toggle()}
						/>
					</ToolbarButton>

					<ToolbarButton onClick={() => editor.insertLink()}>
						<LinkIcon className="w-4 h-4" />
					</ToolbarButton>

					<ToolbarButton onClick={() => editor.insertTime()}>
						<ClockIcon className="w-4 h-4" />
					</ToolbarButton>
				</FixedToolbar>
				<EditorContainer variant="demo">
					<Editor placeholder="Type..." />
				</EditorContainer>
			</Plate>
			{status === "error" && (
				<p className="mt-0.625 font-light text-red">{validationMessage}</p>
			)}
		</>
	);
}
