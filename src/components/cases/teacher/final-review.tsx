import { FC } from "react";
import Cme from "./cme";
import { Button } from "@/components/ui/main-button";
import PlateViewer from "@/lib/PlateViewer";
import { useAppSelector } from "@/services/hooks/hooks";
import { FinalReviewProps } from "@/services/types/teacher/createCaseStudy";
import { formatDateToYYYYMMDD } from "@/utils/formatDate";

const FinalReview: FC<FinalReviewProps> = ({
	caseStudy,
	handleUpdateDraftCase,
	handlePublishCase,
}) => {
	const addingDraftCaseStatus = useAppSelector(
		(state) => state.getDraftCases.status,
	);

	const addCaseStatus = useAppSelector((state) => state.addCase.status);
	const { data: publishedCaseInfo, status: activeCaseStatus } = useAppSelector(
		(state) => state.activeCase,
	);
	const materials = Array.isArray(caseStudy?.caseMaterials)
		? caseStudy.caseMaterials
		: [];
	return (
		<>
			<div className=" border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2 create-case-heading">
					Case Model Topic Description
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<PlateViewer htmlString={caseStudy.caseDescription} />
				</div>
			</div>
			<div className=" border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10 create-case-heading">
					CASE MODEL ANSWER
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<PlateViewer htmlString={caseStudy.caseExplanation} />
				</div>
				<h3 className="uppercase font-bold text-sm text-blue mb-2 create-case-subheading">
					DEADLINE
				</h3>
				<p className="mb-9">{formatDateToYYYYMMDD(caseStudy.caseDeadline)}</p>
			</div>
			<div className="border-b-0.375">
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10 create-case-heading">
					Case Subject
				</h3>
				<p className="mb-9">{caseStudy.caseTopic}</p>
				<h3 className="uppercase font-bold text-sm text-blue mb-2 mt-10 create-case-heading">
					Case Teaching
				</h3>
				<div className="mb-9 bg-gray-200 p-2.5">
					<PlateViewer htmlString={caseStudy.caseTeaching} />
				</div>
				<h3 className="uppercase font-bold text-sm text-blue mb-4 create-case-heading">
					TEACHING MATERIALS
				</h3>
				<ul className="flex flex-col w-full space-y-3 mb-9">
					{materials.map((material) => (
						<li key={material.documentKey}>
							<div className="flex items-center p-2 border-grey-400 border rounded-sm create-case-material-item">
								<span className="text-1sm sm:text-sm text-dark inline-block ml-2 sm:ml-2.5">
									{material.fileName}
								</span>
							</div>
						</li>
					))}
				</ul>
			</div>

			<div>
				<h3 className="uppercase font-bold text-sm text-blue mb-4 mt-10">
					CME QUESTIONS
				</h3>
				<Cme questions={caseStudy.caseQuestions} />
			</div>

			<div
				className={`create-case-actions grid ${!publishedCaseInfo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-4 items-center`}
			>
				<Button
					variant="secondary"
					size="md"
					centralize
					onClick={handleUpdateDraftCase}
					className="w-full sm:text-sm cursor-pointer"
				>
					{addingDraftCaseStatus === "loading" ? "Loading..." : "SAVE DRAFT"}
				</Button>
				{!publishedCaseInfo && (
					<Button
						variant="basic"
						size="md"
						onClick={handlePublishCase}
						disabled={activeCaseStatus === "loading"}
						className="w-full flex items-center justify-center gap-2 sm:text-sm cursor-pointer"
						centralize
					>
						{addCaseStatus === "loading"
							? "Loading..."
							: "POST TO ALL STUDENTS"}
					</Button>
				)}
			</div>
		</>
	);
};

export default FinalReview;
