import { useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layouts/dashboard";
import { Button } from "@/components/ui/main-button";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";
import ResponseCaseCard from "@/components/cases/ResponseCaseCard";
import { resetCaseDetailsState } from "@/store/slices/case/caseDetailsSlice";
import { resetSubmitCaseResponseState } from "@/store/slices/student/SubmitCaseResponseSlice";
import { resetAddFeedbackState } from "@/store/slices/student/addFeedbackSlice";
import { resetCaseMaterialState } from "@/store/slices/case/getCaseMaterialsSlice";
import { resetGetStudentsResponsesToCasesStatus } from "@/store/slices/student/getStudentsResponsesToCasesSlice";

interface StudentDashboardProps {
	hasPaid?: boolean | null;
}

const StudentDashboard = ({ hasPaid }: StudentDashboardProps) => {
	const dispatch = useAppDispatch();

	const publishedCaseInfo = useAppSelector((state) => state.activeCase.data);

	const studentsResponsesToCases = useAppSelector(
		(state) => state.studentsResponsesToCases.responses,
	);

	useEffect(() => {
		dispatch(resetCaseDetailsState());
		dispatch(resetSubmitCaseResponseState());
		dispatch(resetAddFeedbackState());
		dispatch(resetCaseMaterialState());
		dispatch(resetGetStudentsResponsesToCasesStatus());
	}, [dispatch]);

	const studentsResponses: {
		_id: string;
		submittedAt: string;
		caseTopic: string;
	}[] =
		studentsResponsesToCases.map((caseItem: any) => ({
			_id: caseItem.answerID,
			submittedAt: formatDate(caseItem.submittedAt),
			caseTopic: caseItem.caseTopic,
		})) || [];

	return (
		<DashboardLayout>
			<div className="grid gap-y-10 sm:gap-y-12-5">
				{hasPaid === false && (
					<div className="bg-gray-50 border border-gray-200 rounded-sm p-3 mb-6">
						<p className="text-xs text-gray-600">
							Subscribe to access case studies and earn certificates.
						</p>
						<Link
							href="/pricing"
							className="text-xs underline text-gray-600 hover:text-gray-800 mt-2 inline-block"
						>
							View pricing →
						</Link>
					</div>
				)}
				{hasPaid === true && (
					<div>
						{publishedCaseInfo ? (
							<h5 className="text-1sm sm:text-base text-dark mb-3 sm:mb-5">
								ONGOING CASE STUDY
							</h5>
						) : (
							<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-5" />
						)}
						<div className="w-full px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 ongoing-case bg-[url('/images/ongoing-case-bg.png')] flex flex-col sm:flex-row sm:items-center justify-between flex-wrap text-white rounded-sm relative">
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
									<h5 className="font-bold text-base mt-3-75 mb-2.5">1 CME</h5>
									{/* Ideally this should be saved and retrieved from user details in cognito */}
									<h5>
										Faculty: Dr. Emmanuel Abu (MBBS, MSc, PhD, PGCert(Mgt),
										PGCert(MedEd), Dp FMs, FRCP, FRCPath)
									</h5>

									<div className="sm:mt-3">
										<div className="inline-block text-1xs text-base">
											<b>Created:</b> {formatDate(publishedCaseInfo?.createdAt)}
										</div>
										<div className="block sm:inline-block text-1xs sm:ml-8 text-base">
											<b>Deadline:</b>{" "}
											{formatDate(publishedCaseInfo?.caseDeadline)}
										</div>
									</div>
								</div>
							) : (
								<p className="text-white">
									There is no active case at the moment.
								</p>
							)}

							{publishedCaseInfo && (
								<div className="min-w-min inline-block">
									<Button
										className="mr-1 text-1xs sm:text-sm"
										variant="white"
										size="md"
										href={`/student/case-studies/${publishedCaseInfo?.id}`}
										uppercase
									>
										View Case
									</Button>
								</div>
							)}
						</div>
					</div>
				)}
				<div className="">
					<div className="flex justify-between items-center mb-3-75">
						<h5 className="text-1sm sm:text-base text-dark uppercase">
							RECENT CASE STUDIES
						</h5>
					</div>
					<ul className="grid grid-cols-items gap-5 md:gap-6-25">
						{studentsResponses?.length === 0
							? "You have no recent case studies."
							: studentsResponses.map(
									(caseM: {
										_id: string;
										submittedAt: string;
										caseTopic: string;
									}) => {
										return <ResponseCaseCard case={caseM} key={caseM._id} />;
									},
								)}
					</ul>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default StudentDashboard;
