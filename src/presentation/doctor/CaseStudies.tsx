import React, { useState } from "react";
import AdminLayout from "@/components/layouts/dashboard/admin";
import { SearchBar } from "@/components/form-elements";
import Link from "next/link";
import { CaseCard } from "@/components/cases";
import { useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";

interface IProps {
	handleDeleteCase: (caseId: string) => void;
}

const DoctorCaseStudies = ({ handleDeleteCase }: IProps) => {
	// const allCasesState = useAppSelector((state) => state.getAllCases.cases); // this will become archinved cases
	const draftCasesState = useAppSelector((state) => state.getDraftCases.cases);

	const draftCases = draftCasesState.map((caseItem: any) => ({
		_id: caseItem.id,
		caseTopic: caseItem.caseTopic,
		description: caseItem.caseDescription
			? JSON.parse(caseItem.caseDescription).blocks[0].text
			: "",
		caseDeadline: formatDate(caseItem.caseDeadline),
		createdAt: formatDate(caseItem.createdAt),
		caseStatus: caseItem.caseStatus,
	}));

	return (
		<AdminLayout>
			<div className="mt-7.5">
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
		</AdminLayout>
	);
};

export default DoctorCaseStudies;
