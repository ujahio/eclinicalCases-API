'use client';

import React from 'react';

import type { Value } from 'platejs';

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
import { H1Element, H2Element, H3Element } from '@/components/ui/heading-node';
import { LinkElement } from '@/components/ui/link-node';
import { LinkFloatingToolbar } from '@/components/ui/link-toolbar';
import {
	BulletedListElement,
	NumberedListElement,
} from '@/components/ui/list-classic-node';

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

interface PlateViewerProps {
	value?: Value;
	jsonString?: string;
	className?: string;
}

const PlateViewer: React.FC<PlateViewerProps> = ({
	value,
	jsonString,
	className,
}) => {
	const initialValue: Value = React.useMemo(() => {
		if (jsonString) {
			try {
				const parsed = JSON.parse(jsonString);
				if (Array.isArray(parsed)) return parsed;
			} catch {
				// fall through
			}
		}
		if (value && Array.isArray(value)) return value;
		return [{ children: [{ text: '' }], type: 'p' }];
	}, [value, jsonString]);

	const editor = usePlateEditor({
		plugins,
		value: initialValue,
	});

	return (
		<Plate editor={editor}>
			<EditorContainer>
				<Editor readOnly className={className} />
			</EditorContainer>
		</Plate>
	);
};

export default PlateViewer;
