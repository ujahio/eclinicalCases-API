import { convertFromRaw, Editor, EditorState } from "draft-js";
import React from "react";
import Cme from "./cme";

const ResponseModal = ({ answers }: any) => {
	const rawContent =
		answers && answers[0] && answers[0].caseExplanation
			? JSON.parse(answers[0].caseExplanation)
			: { blocks: [], entityMap: {} };
	const studentCaseDescription = EditorState.createWithContent(
		convertFromRaw(rawContent)
	);
	return (
		<div>
			<div>
				<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
					CASE STUDY
				</h6>
				<p>{answers ? answers[0].caseTopicAnswer : ""}</p>
				{/* <p className="text-sm mt-4 leading-6">Integer ac interdum lacus.</p> */}
				<div className="text-dark sm:text-base text-1sm">
					<div className="mb-9 bg-gray-200 p-2.5">
						<Editor
							editorState={studentCaseDescription}
							readOnly={true}
							onChange={() => {}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResponseModal;
