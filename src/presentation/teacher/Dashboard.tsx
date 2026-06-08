import { CaseCard } from "@/components/cases";
import AdminLayout from "@/components/layouts/dashboard/admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";

const TeacherDashboard = () => {
	const archivedCasesState = useAppSelector(
		(state) => state.getArchiveCases.cases,
	);
	const publishedCaseInfo = useAppSelector((state) => state.activeCase.data);

	const archivedCases = archivedCasesState.map((caseItem: any) => ({
		...caseItem,
		_id: caseItem.id,
		caseDeadline: formatDate(caseItem.caseDeadline),
		createdAt: formatDate(caseItem.createdAt),
	}));

	return (
		<AdminLayout>
			<div className="mt-14">
				<div className="mb-3 sm:mb-6">
					{/* Mobile-only: Create button above heading */}
					<div className="mb-7 block sm:hidden">
						<Button
							href="/teacher/case-studies/create"
							variant="basic"
							type="button"
							size="md"
							className="mr-1 text-1xs sm:text-sm"
							centralize
						>
							<span>
								{publishedCaseInfo ? "Draft New Case" : "Create New Case"}
							</span>
						</Button>
					</div>

					<div className="flex items-center justify-between">
						<h5 className="text-1sm sm:text-base text-dark uppercase">
							ONGOING CASE STUDY
						</h5>

						{/* Desktop-only: Create button on the right */}
						<div className="hidden sm:block">
							<Button
								href="/teacher/case-studies/create"
								variant="basic"
								type="button"
								size="md"
								className="mr-1 text-1xs sm:text-sm"
								uppercase
							>
								<span>
									{publishedCaseInfo ? "Draft a Case" : "Create New Case"}
								</span>
							</Button>
						</div>
					</div>
				</div>

				<div className="w-full px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 ongoing-case flex flex-col sm:flex-row sm:items-center justify-between flex-wrap text-white rounded-sm">
					{publishedCaseInfo ? (
						<div className="flex flex-col md:mr-4 mb-4">
							<svg
								className="w-6-25 sm:w-8 md:w-10"
								viewBox="0 0 44.604 51.855"
							>
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
							<h5 className="font-bold text-base mt-3-75 mb-3.5">
								{publishedCaseInfo?.caseTopic}
							</h5>
							<div>
								<span className="inline-block text-sm text-white/90">
									<b className="font-semibold text-white mr-1">Created:</b>
									<span className="font-normal">
										{formatDate(publishedCaseInfo?.createdAt)}
									</span>
								</span>
								<span className="block sm:inline-block text-sm text-white/90 sm:ml-8">
									<b className="font-semibold text-white mr-1">Deadline:</b>
									<span className="font-normal">
										{formatDate(publishedCaseInfo?.caseDeadline)}
									</span>
								</span>
							</div>
							{/* Mobile-only INFO button placed above badges and left-aligned */}
							<div className="block sm:hidden mt-4 mb-2">
								<Link
									href={`/teacher/responses-feedback/${publishedCaseInfo.id}`}
								>
									<Button
										type="button"
										variant="white"
										className="mr-1 text-1xs sm:text-sm"
									>
										INFO
									</Button>
								</Link>
							</div>

							<div className="flex mt-6">
								<div className="bg-dark bg-opacity-20 text-white rounded-sm px-3 py-2 text-xs inline-flex items-center justify-center mr-3">
									{publishedCaseInfo?.feedbackCount} Feedback
								</div>
								<div className="bg-dark bg-opacity-20 text-white rounded-sm px-3 py-2 text-xs inline-flex items-center justify-center">
									{publishedCaseInfo?.totalResponses} Responses
								</div>
							</div>
						</div>
					) : (
						<p className="text-white">There is no active case at the moment.</p>
					)}
					{publishedCaseInfo && (
						<div className="hidden sm:flex w-auto mb-0 sm:mb-0">
							<div className="flex">
								<Link
									href={`/teacher/responses-feedback/${publishedCaseInfo.id}`}
								>
									<Button
										type="button"
										size="md"
										variant="white"
										className="mr-3"
									>
										INFO
									</Button>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className="mt-14">
				<div className="flex justify-between items-center mb-3-75">
					<h5 className="text-1sm sm:text-base text-dark uppercase">
						RECENT CASE STUDIES
					</h5>
					{archivedCases?.length > 0 ? (
						<Link
							href="/teacher/cases"
							className="text-dark font-medium text-sm sm:text-1sm cursor-pointer transition-colors hover:text-primary-300"
						>
							View All
						</Link>
					) : null}
				</div>
				<ul className="grid grid-cols-items gap-5 md:gap-6-25">
					{archivedCases?.length === 0
						? "You have no recent case studies."
						: archivedCases?.map((caseM: any, index: number) => (
								<Link
									href={`/teacher/responses-feedback/${caseM._id}`}
									key={index}
								>
									<CaseCard case={caseM} key={caseM._id} />
								</Link>
							))}
				</ul>
			</div>
		</AdminLayout>
	);
};

export default TeacherDashboard;
