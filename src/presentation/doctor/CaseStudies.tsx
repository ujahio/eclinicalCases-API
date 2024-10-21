import React, { useState } from "react";
import AdminLayout from "@/components/layouts/dashboard/admin";
import { CaseCard } from "@/components/cases";
import { useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";

interface IProps {
	handleDeleteCase: (caseId: string) => void;
}

const DoctorCaseStudies = ({ handleDeleteCase }: IProps) => {
	const archivedCasesState = useAppSelector(
		(state) => state.getArchiveCases.cases
	);
	const draftCasesState = useAppSelector((state) => state.getDraftCases.cases);
	const [activeTab, setActiveTab] = useState("drafts");

	const draftCases = draftCasesState.map((caseItem: any) => ({
		_id: caseItem.id,
		caseTopic: caseItem?.caseTopic,
		description: caseItem?.caseDescription
			? JSON.parse(caseItem?.caseDescription).blocks[0].text
			: "",
		caseDeadline: formatDate(caseItem?.caseDeadline),
		createdAt: formatDate(caseItem?.createdAt),
		caseStatus: caseItem?.caseStatus,
	}));

	const archivedCases =
		archivedCasesState.map((caseItem: any) => ({
			_id: caseItem.id,
			description: JSON.parse(caseItem.caseDescription).blocks[0].text,
			caseDeadline: formatDate(caseItem.caseDeadline),
			createdAt: formatDate(caseItem.createdAt),
			feedbackCount: caseItem.feedbackCount,
			totalResponses: caseItem.totalResponses,
			caseTopic: caseItem.caseTopic,
			caseStatus: caseItem.caseStatus,
		})) || null;

	const renderContent = () => {
		switch (activeTab) {
			case "drafts":
				return (
					<div className="tab-content">
						<ul className="grid grid-cols-items gap-5 md:gap-6.25">
							{draftCases?.length > 0 ? (
								<>
									{draftCases.map((caseS: any) => (
										<CaseCard
											case={caseS}
											key={caseS._id}
											handleDeleteCase={handleDeleteCase}
										/>
									))}
								</>
							) : (
								<p className="text-black">
									No cases found matching your search query.
								</p>
							)}
						</ul>
					</div>
				);
			case "archived":
				return (
					<div className="tab-content">
						<ul className="grid grid-cols-items gap-5 md:gap-6.25">
							{archivedCases?.length > 0 ? (
								<>
									{archivedCases.map((caseS: any) => (
										<CaseCard
											case={caseS}
											key={caseS._id}
											handleDeleteCase={handleDeleteCase}
										/>
									))}
								</>
							) : (
								<p className="text-black">
									No cases found matching your search query.
								</p>
							)}
						</ul>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<AdminLayout>
			<div className="mt-7.5">
				<div className="flex justify-around border-b border-gray-200 mb-5">
					<button
						className={`flex-1 py-2 text-center text-gray-500 hover:text-black focus:outline-none focus:border-b-2 focus:border-black ${
							activeTab === "drafts"
								? "text-black border-b-2 border-black"
								: "text-gray-500 hover:text-black"
						}`}
						onClick={() => setActiveTab("drafts")}
					>
						<h3 className="text-1sm">DRAFTS</h3>
					</button>
					<button
						className="flex-1 py-2 text-center text-gray-500 hover:text-black focus:outline-none focus:border-b-2 focus:border-black"
						onClick={() => setActiveTab("archived")}
					>
						<h3 className="text-1sm">ARCHIVED</h3>
					</button>
				</div>
				{renderContent()}
			</div>
		</AdminLayout>
	);
};

export default DoctorCaseStudies;
