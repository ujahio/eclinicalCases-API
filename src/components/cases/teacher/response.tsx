import { convertFromRaw, Editor, EditorState } from "draft-js";

const ResponseModal = ({ caseExplanation }: any) => {
	const rawContent = caseExplanation
		? JSON.parse(caseExplanation)
		: { blocks: [], entityMap: {} };

	const studentCaseDescription = EditorState.createWithContent(
		convertFromRaw(rawContent),
	);
	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5 create-case-heading">
				STUDENT&apos;S RESPONSE
			</h6>
			<div className="text-dark sm:text-base text-1sm">
				<div className="mb-9 bg-gray-200 p-2.5">
					<Editor
						editorState={studentCaseDescription}
						readOnly={true}
						onChange={() => {}}
					/>
				</div>
			</div>
		</>
	);
};

export default ResponseModal;
