import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/dashboard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import WalkthroughModal from "@/components/modals/Walkthrough";
import CaseCard from "@/components/cases/CaseCard";
import { useAppSelector } from "@/services/hooks/hooks";
import { formatDate } from "@/utils/formatDate";

const StudentDashboard = () => {
	const [showWelcomeModal, setShowWelcomeModal] = useState(true);
	//   const { user } = SessionContext.useContainer();
	useEffect(() => {
		setTimeout(() => {
			setShowWelcomeModal(true);
		}, 500);
	}, []);
	const archivedCasesState = useAppSelector(
		(state) => state.getArchiveCases.cases
	);
	// const publishedCaseInfo = useAppSelector((state) => state.onGoingCase.cases);
	const publishedCaseInfo = useAppSelector((state) => state.activeCase.data);

	const cases =
		archivedCasesState?.map((caseItem: any) => ({
			_id: caseItem.id,
			description: JSON.parse(caseItem.caseDescription).blocks[0].text,
			caseDeadline: formatDate(caseItem.caseDeadline),
			createdAt: formatDate(caseItem.createdAt),
			feedbackCount: caseItem.feedbackCount,
			totalResponses: caseItem.totalResponses,
			caseTopic: caseItem.caseTopic,
		})) || [];
	return (
		<DashboardLayout>
			<div className="grid gap-y-10 sm:gap-y-12.5">
				{/* <div className="flex items-center justify-between">
          <div className="inline-flex items-center">
             <figure className="h-8 md:h-11.25 w-8 md:w-11.25 rounded-full overflow-hidden">
              <img src={UserImg} alt="User image" className="h-full w-full" />
            </figure>
            <h4 className="text-dark font-medium text-1sm sm:text-base inline-block ml-2.5">
              {`Hi, ${user?.name} 👋`}
            </h4>
          </div>
        </div> */}
				<div className="">
					<h5 className="text-1sm sm:text-base text-dark uppercase mb-3.75">
						ONGOING CASE STUDY
					</h5>

					<div
						// style={{ backgroundImage: `url${OnGoingCaseBg}` }}
						className="w-full px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 ongoing-case bg-[url('../../assets/images/ongoing-case-bg.png')] flex flex-col sm:flex-row sm:items-center justify-between flex-wrap text-white rounded-sm relative"
					>
						{publishedCaseInfo?.data?.length > 0 ? (
							<div className="flex flex-col md:mr-4 mb-4">
								<svg
									className="w-6.25 sm:w-8 md:w-10"
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
								<h5 className="font-bold text-base mt-3.75 mb-2.5">
									{publishedCaseInfo?.data[0]?.caseTopic}
								</h5>
								<p className="text-1sm text-sm max-w-lg mb-5">
									Learn how patients with a serious infection can be managed in
									outpatient settings with the help of an OPAT service.
								</p>
								<div>
									<span className="inline-block text-1xs">
										<b>Created:</b>{" "}
										{formatDate(publishedCaseInfo?.data[0]?.createdAt)}
									</span>
									<span className="block sm:inline-block text-1xs sm:ml-8">
										<b>Deadline:</b>{" "}
										{formatDate(publishedCaseInfo?.data[0]?.caseDeadline)}
									</span>
								</div>
							</div>
						) : (
							<p className="text-white">{"No ongoing cases found!!!"}</p>
						)}

						<div className="min-w-min inline-block">
							<Button
								type="button"
								size="md"
								btnStyle="white"
								{...(publishedCaseInfo?.data?.length > 0 && {
									href: `/student/case-studies/${publishedCaseInfo.data[0].id}`,
								})}
							>
								View Case
							</Button>
						</div>
					</div>
				</div>
				<div className="">
					<div className="flex justify-between items-center mb-3.75">
						<h5 className="text-1sm sm:text-base text-dark uppercase">
							RECENT CASE STUDIES
						</h5>
						{/* <Link
              href="/student/case-studies"
              className="text-dark font-medium text-sm sm:text-1sm cursor-pointer transition-colors hover:text-primary-300"
            >
              {`View all `}
            </Link> */}
					</div>
					<ul className="grid grid-cols-items gap-5 md:gap-6.25">
						{cases?.length === 0
							? "No recent cases found!!!"
							: cases?.map((caseM: any, index: number) => (
									<Link href={`/student/case-studies/${caseM._id}`} key={index}>
										<CaseCard case={caseM} />
									</Link>
							  ))}
					</ul>
				</div>
			</div>
			<WalkthroughModal
				show={showWelcomeModal}
				toggle={setShowWelcomeModal}
				size="lg"
			/>
		</DashboardLayout>
	);
};

export default StudentDashboard;
