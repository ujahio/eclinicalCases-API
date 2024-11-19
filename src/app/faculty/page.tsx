"use client";

import React, { useState } from "react";
import Image from "next/image";
import medStaff from "@/assets/images/medstaff.jpg";
import { APP_CONTAINER, LANDING_X_PADDING } from "@/services/constants/styles";
import Navbar from "@/components/Navbar";
import WalkthroughModal from "@/components/modals/Walkthrough";

const Page = () => {
	const [showWelcomeModal, setShowWelcomeModal] = useState(false);

	return (
		<>
			<Navbar activeTab="faculty" setShowWelcomeModal={setShowWelcomeModal} />
			<div
				className={`bg-primary-100 py-15 sm:py-32 sm:grid grid-cols-2 ${LANDING_X_PADDING} ${APP_CONTAINER}`}
			>
				<div>
					<Image src={medStaff} alt="faculty-profile-pic" className=" w-full" />
				</div>
				<div className="mt-12 sm:mt-0 md:ml-10 sm:ml-10 lg:ml-28 max-w-sm">
					<p className="text-darker font-bold text-3xl sm:mb-4">
						Faculty Profile
					</p>
					<h3>
						Dr Emmanuel Abu has vast amounts of local and international
						experience in clinical laboratory medicine spanning over 20 years in
						large tertiary hospitals and in modest medical centres. Whilst in
						the UK, he developed a similar online interactive teaching program
						that was accredited by the Royal College of General Practitioners.
						He holds an MSc in Clinical Biochemistry with distinction from the
						University of Surrey, UK, a PhD from St. John’s College, University
						of Cambridge, UK. He is a Fellow of the Royal College of Physicians
						and Pathologists, UK. He also holds a PGCert in Medical Education
						from the University of Warrick, UK, PGCert in Hospital and Social
						care management, Henley Business school, University f Reading UK and
						an advanced diploma in forensic medical sciences awarded by the
						Society of Apothecaries of London, UK. He has been involved in
						teaching and training of biomedical and clinical scientists and
						postgraduate medical doctors. He is passionate about impacting
						knowledge that matters in the provision of quality care to patients.
					</h3>
				</div>
			</div>
			<WalkthroughModal
				show={showWelcomeModal}
				toggle={setShowWelcomeModal}
				size="md"
			/>
		</>
	);
};

export default Page;
