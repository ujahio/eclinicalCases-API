import React, { useState } from "react";
import student1 from "@/assets/images/student1.png";
import student2 from "@/assets/images/student2.png";
import student3 from "@/assets/images/student3.png";
import student4 from "@/assets/images/student4.png";
import AdminLayout from "@/components/layouts/dashboard/admin";
import Image from "next/image";
import ResponseFeedbackModal from "@/components/modals/response-feedback-modal";
import { formatDate } from "@/utils/formatDate";

const ResponsesAndFeedback = ({
	student,
	setStudent,
	caseFeedbackAndResponsesInfo,
}) => {
	console.log("caseFeedbackAndResponsesInfo", caseFeedbackAndResponsesInfo);
	const [showResponseAndFeedbackModal, setShowResponseAndFeedbackModal] =
		useState(false);
	return (
		<AdminLayout>
			<article
				role="button"
				className="flex flex-col bg-white border border-grey-400 border-opacity-80 rounded-sm p-6 sm:p-8 md:w-full text-dark cursor-pointer bg-opacity-100 hover:bg-opacity-50 transition-all mb-6"
			>
				<svg className="w-6.25 sm:w-8 md:w-10" viewBox="0 0 44.604 51.855">
					<g transform="translate(16661.051 -9005.123)">
						<path
							d="M55.665,6.439H28.327V5.748A.754.754,0,0,0,27.636,5H21.881a.762.762,0,0,0-.748.748V6.5H13.939A1.425,1.425,0,0,0,12.5,7.935V55.416a1.425,1.425,0,0,0,1.439,1.439H55.665A1.425,1.425,0,0,0,57.1,55.416V7.878A1.425,1.425,0,0,0,55.665,6.439Zm-28.776,0V17.662l-1.669-1.669a.857.857,0,0,0-.518-.23.7.7,0,0,0-.518.23l-1.611,1.669V6.439ZM15.378,9.316h2.187v44.6H15.378Zm38.848,44.6H19V9.316H21.19V19.388a.748.748,0,0,0,.46.691.713.713,0,0,0,.806-.173l2.36-2.36,2.36,2.36a.857.857,0,0,0,.518.23.519.519,0,0,0,.288-.058.9.9,0,0,0,.345-.691V9.316h25.9Z"
							transform="translate(-16673.551 9000.123)"
							fill="currentColor"
						/>
						<path
							d="M36.948,38.452a.762.762,0,0,0-.748.748v5.755a.762.762,0,0,0,.748.748h6.5v6.5a.762.762,0,0,0,.748.748h5.755a.762.762,0,0,0,.748-.748V45.646h6.5a.762.762,0,0,0,.748-.748V39.142a.762.762,0,0,0-.748-.748H50.646V31.948A.762.762,0,0,0,49.9,31.2H44.142a.762.762,0,0,0-.748.748v6.5Zm7.194,1.439a.762.762,0,0,0,.748-.748V32.7h4.316v6.446a.762.762,0,0,0,.748.748h6.5v4.316H49.9a.762.762,0,0,0-.748.748v6.5H44.833V44.9a.762.762,0,0,0-.748-.748H37.7V39.833h6.446Z"
							transform="translate(-16683.611 8991.001)"
							fill="currentColor"
						/>
					</g>
				</svg>
				<h5 className="font-bold text-base mt-3.75 mb-2.5">Malaria</h5>
				<div className=" bg-neutral-200  rounded-sm w-40 text-center py-2 text-xs">
					4 Responses & Feedbacks
				</div>
			</article>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-2 w-full">
				{caseFeedbackAndResponsesInfo.map(
					({ img, firstName, lastName, id, submittedAt }) => (
						<div
							className="bg-white border-grey-border border-0.375 rounded-sm sm:w-64 md:w-80 lg:w-64 xl:w-88 sm:px-4 md:px-7 px-7 py-5 cursor-pointer"
							id="firsStudent"
							onClick={() => {
								setStudent(id);
								setShowResponseAndFeedbackModal(true);
							}}
							key={id}
						>
							<div className="flex">
								<Image src={img} alt="" className="w-auto h-12" />
								<div className="ml-3">
									<h2 className="text-lg text-dark font-medium">{`${firstName} ${lastName}`}</h2>
									<p className="text-grey-300">
										<span className="font-medium">Submitted on:</span>{" "}
										{formatDate(submittedAt)}
									</p>
								</div>
							</div>
						</div>
					)
				)}
			</div>
			<ResponseFeedbackModal
				student={student}
				show={showResponseAndFeedbackModal}
				toggle={setShowResponseAndFeedbackModal}
			/>
		</AdminLayout>
	);
};

// const data = [
// 	{
// 		img: student1,
// 		name: "John Doe",
// 		id: "first",
// 	},
// 	{
// 		img: student2,
// 		name: "Ifeoluwa Olabode",
// 		id: "second",
// 	},
// 	{
// 		img: student3,
// 		name: "Amos Covenant",
// 		id: "third",
// 	},
// 	{
// 		img: student4,
// 		name: "Doyinsola Precious",
// 		id: "last",
// 	},
// ];

export default ResponsesAndFeedback;
