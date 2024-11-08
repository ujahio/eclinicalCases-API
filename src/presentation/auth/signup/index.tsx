import useProcessTabs from "@/services/hooks/useProcessTabs";
import React, { useState } from "react";
import { SignUpForm } from "./components/form";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";
import ProcessTabs from "@/components/ui/process-tabs";
import ProfessionalDetailsForm from "./components/professional-details-form";
import ReviewAndConfirm from "./components/ReviewAndConfirm";
import { SignupCompProps } from "@/services/types/auth/signup";

const tabs = ["Personal Details", "Professional Details", "Review and Confirm"];

type ProfessionalDetailsProps = {};

const Signup = ({ handleSignUp }: SignupCompProps) => {
	const {
		active: activeTab,
		isActive,
		switchTab,
		switchByKey,
	} = useProcessTabs(tabs, 0);

	const [personalDetailsInfo, savePersonalDetails] = useState({
		personalDetails: {},
		professionalDetails: {},
	});

	const handleCapturePersonalDetails = (personalDetails: {}) => {
		savePersonalDetails({ ...personalDetailsInfo, personalDetails });
	};

	const handleCaptureProfessionalDetails = (
		professionalDetails: ProfessionalDetailsProps
	) => {
		savePersonalDetails({ ...personalDetailsInfo, professionalDetails });
	};

	return (
		<div className="flex flex-col items-center min-h-screen">
			{/* <nav className="bg-white h-17.5 flex items-center justify-center w-full border-b border-grey-400 border-opacity-40">
				<ProcessTabs
					active={activeTab}
					changeTab={switchTab}
					tabs={tabs}
					canClickBackward={true}
					canClickForward={false}
				/>
			</nav> */}

			<div className="mt-7 w-full">
				<div className="w-11/12 max-w-200 bg-white py-10 px-6 sm:p-10 md:p-12.5 border border-grey-border rounded-sm mx-auto">
					<figure className="h-5 sm:h-6">
						<Image src={Logo} alt="E Clinic logo" className="h-full w-auto" />
					</figure>

					<div className="mt-8">
						{/* <h4 className="text-lg font-medium text-dark">{tabs[activeTab]}</h4> */}
						{/* {isActive("personal_details") && ( */}
						<SignUpForm
							// switchByKey={switchByKey}
							// caputurePersonalDetails={handleCapturePersonalDetails}
							personalDetailsInfo={personalDetailsInfo}
							handleSignUp={handleSignUp}
						/>
						{/* )} */}
						{/* {isActive("professional_details") && (
							<ProfessionalDetailsForm
								switchByKey={switchByKey}
								handleCaptureProfessionalDetails={
									handleCaptureProfessionalDetails
								}
							/>
						)}
						{isActive("review_and_confirm") && (
							<ReviewAndConfirm
								personalDetailsInfo={personalDetailsInfo}
								handleSignUp={handleSignUp}
							/>
						)} */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
