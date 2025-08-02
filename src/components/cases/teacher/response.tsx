import { ReadOnlyEditor } from "@/components/editor/read-only-editor";
import React from "react";

const ResponseModal = ({ caseExplanation }: any) => {
	return (
		<>
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5">
				STUDENT&apos;S RESPONSE
			</h6>
			<div className="text-dark sm:text-base text-1sm">
				<div className="mb-9 bg-gray-200 p-2.5">
					<ReadOnlyEditor content={caseExplanation} />
				</div>
			</div>
		</>
	);
};

export default ResponseModal;
