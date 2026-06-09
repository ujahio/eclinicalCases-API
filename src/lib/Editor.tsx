'use client';

import React, { useEffect, useState } from 'react';

import type { Value } from 'platejs';
import { serializeHtml } from 'platejs/static';

import {
	BlockquotePlugin,
	BoldPlugin,
	CodePlugin,
	H1Plugin,
	H2Plugin,
	H3Plugin,
	ItalicPlugin,
	StrikethroughPlugin,
	UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { LinkPlugin } from '@platejs/link/react';
import {
	BulletedListPlugin,
	ListItemPlugin,
	ListPlugin,
	NumberedListPlugin,
} from '@platejs/list-classic/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { BlockquoteElement } from '@/components/ui/blockquote-node';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import { LinkElement } from '@/components/ui/link-node';
import { LinkFloatingToolbar } from '@/components/ui/link-toolbar';
import {
	BulletedListElement,
	NumberedListElement,
} from '@/components/ui/list-classic-node';
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button';
import { ToolbarButton } from '@/components/ui/toolbar';

interface CaseEditorProps {
	content: string | undefined;
	onContentChange: (updatedContent: string) => void;
	status?: 'valid' | 'error';
	validationMessage?: string;
}

const plugins = [
	BoldPlugin,
	ItalicPlugin,
	UnderlinePlugin,
	StrikethroughPlugin,
	CodePlugin,
	H1Plugin.withComponent(H1Element),
	H2Plugin.withComponent(H2Element),
	H3Plugin.withComponent(H3Element),
	BlockquotePlugin.withComponent(BlockquoteElement),
	ListPlugin,
	ListItemPlugin,
	BulletedListPlugin.withComponent(BulletedListElement),
	NumberedListPlugin.withComponent(NumberedListElement),
	LinkPlugin.configure({
		render: {
			node: LinkElement,
			afterEditable: () => <LinkFloatingToolbar />,
		},
	}),
];

function parseContent(content: string | undefined, editor: ReturnType<typeof usePlateEditor>): Value {
	if (!content || !editor) return [{ children: [{ text: '' }], type: 'p' }];
	try {
		const parsed = editor.api.html.deserialize({ element: content });
		if (Array.isArray(parsed)) return parsed;
	} catch {
		// fall through
	}
	return [{ children: [{ text: '' }], type: 'p' }];
}

const CaseEditor: React.FC<CaseEditorProps> = ({
	content,
	onContentChange,
	status = 'valid',
	validationMessage = '',
}) => {
	const [currentContent, setCurrentContent] = useState(content);

	const editor = usePlateEditor({
		plugins,
		value: [{ children: [{ text: '' }], type: 'p' }],
	});

	useEffect(() => {
		if (content !== currentContent) {
			const newValue = parseContent(content, editor);
			editor.tf.setValue(newValue);
			setCurrentContent(content);
		}
	}, [content, currentContent, editor]);

	return (
		<>
			<Plate
				editor={editor}
				onChange={async () => {
					const html = await serializeHtml(editor);
					if (html !== currentContent) {
						setCurrentContent(html);
						onContentChange(html);
					}
				}}
			>
				<FixedToolbar className="justify-start rounded-t-lg">
					<MarkToolbarButton nodeType="bold" tooltip="Bold">
						B
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="italic" tooltip="Italic">
						I
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="underline" tooltip="Underline">
						U
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="strikethrough" tooltip="Strikethrough">
						S
					</MarkToolbarButton>
					<MarkToolbarButton nodeType="code" tooltip="Code">
						{'</>'}
					</MarkToolbarButton>

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

					<ToolbarButton
						onClick={() => editor.tf.insertNodes({ children: [{ text: '' }], type: 'ul', isExpanded: true })}
					>
						• List
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.tf.insertNodes({ children: [{ text: '' }], type: 'ol', isExpanded: true })}
					>
						1. List
					</ToolbarButton>

					<ToolbarButton onClick={() => editor.tf.undo()}>
						Undo
					</ToolbarButton>
					<ToolbarButton onClick={() => editor.tf.redo()}>
						Redo
					</ToolbarButton>

					<ToolbarButton
						onClick={() => {
							editor.tf.insertNodes({
								children: [{ text: '' }],
								type: 'a',
								url: '',
							});
						}}
					>
						Link
					</ToolbarButton>
				</FixedToolbar>

				<EditorContainer>
					<Editor
						style={{
							minHeight: '400px',
							border:
								status === 'error'
									? '1px solid red'
									: 'solid 1px #E7EBEF',
							padding: '0px 15px',
						}}
					/>
				</EditorContainer>
			</Plate>
			{status === 'error' && (
				<p className="mt-0.625 font-light text-red">{validationMessage}</p>
			)}
		</>
	);
};

export default CaseEditor;
