import { useRouter } from "next/navigation";
import React, { FunctionComponent } from "react";
import Button from "../ui/Button";
import { useAppSelector } from "@/services/hooks/hooks";

export interface CaseCardProps {
	case: {
		_id: string;
		caseTopic?: string;
		caseDeadline?: string;
		createdAt: string;
		feedbackCount?: string;
		totalResponses?: string;
		caseStatus?: string;
	};
	handleDeleteCase?: any;
}

const CaseCard: FunctionComponent<CaseCardProps> = ({
	case: {
		_id,
		caseTopic,
		caseDeadline,
		createdAt,
		feedbackCount,
		totalResponses,
		caseStatus,
	},
	handleDeleteCase,
}) => {
	const navigate = useRouter();
	const deleteCaseState = useAppSelector((state) => state.deleteCase.status);

	return (
		<article
			role="button"
			onClick={() => {
				// navigate.push(`/student/case-studies/${_id}`);
			}}
			className="flex flex-col bg-white border border-grey-400 border-opacity-80 rounded-sm p-6 sm:p-8 md:max-w-md text-dark cursor-pointer bg-opacity-100 hover:bg-opacity-50 transition-all relative"
		>
			{caseStatus === "draft" ? (
				<div className="py-2 px-3.5 bg-slate-400 absolute right-3 top-3 capitalize text-white">
					{caseStatus}
				</div>
			) : null}

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
			<h5 className="font-bold text-base mt-3.75 mb-2.5">{caseTopic}</h5>
			<div className="flex flex-wrap items-center text-1xs justify-between mt-2">
				<span className="inline-block pt-3">
					<b>Created:</b> {createdAt}
				</span>
				<span className="inline-block pt-3">
					<b>Deadline:</b> {caseDeadline}
				</span>
			</div>

			<div className="flex mt-4">
				<div className=" bg-neutral-200  rounded-sm w-24 text-center py-2 text-xs">
					{feedbackCount || 0} Feedback
				</div>
				<div className=" bg-neutral-200  rounded-sm w-24 text-center py-2 ml-3 text-xs">
					{totalResponses || 0} Responses
				</div>
			</div>

			{caseStatus === "draft" && (
				<div className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-3">
					<Button
						btnStyle="outline"
						size="md"
						centralize
						onClick={(e) => {
							e.stopPropagation();
							navigate.push(`/doctor/case-studies/update/${_id}`);
						}}
					>
						Update
					</Button>
					<Button
						btnStyle="basic"
						size="md"
						className="text-xs bg-rose-500 text-white"
						centralize
						onClick={() => {
							handleDeleteCase(_id);
						}}
					>
						{deleteCaseState === "loading" ? "Loading..." : "Delete"}
					</Button>
				</div>
			)}
			{/* 
      TODO: reinstate when duplicate feature is ready
      {caseStatus === "archived" && (
				<div className="grid sm:grid-cols-2 grid-cols-1 gap-4 mt-3">
					<Button
						btnStyle="outline"
						size="md"
						centralize
						onClick={(e) => {
							e.stopPropagation();
							// navigate.push(`/doctor/case-studies/update/${_id}`);
						}}
					>
						DUPLICATE
					</Button>
				</div>
			)} */}
		</article>
	);
};

export default CaseCard;
