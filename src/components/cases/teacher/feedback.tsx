import React from "react";

const FeedbackModal = ({ feedback }: any) => {
	return (
		<div className="pb-24">
			<h6 className="text-1xs sm:text-sm font-bold text-blue uppercase mb-2.5 mt-10">
				FEEDBACK
			</h6>
			{feedback.map(
				(
					questionInfo: { question: string; response: string },
					index: number
				) => {
					return (
						<div key={index}>
							<h5 className="mt-4 text-dark">
								{index + 1}. &nbsp;&nbsp; {questionInfo.question}
							</h5>
							<p className="text-grey-300 text-sm ml-6.25 mt-1">
								{questionInfo.response}
							</p>
						</div>
					);
				}
			)}
		</div>
	);
};

export default FeedbackModal;
