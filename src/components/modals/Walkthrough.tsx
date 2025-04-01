import React, { FunctionComponent, useState } from "react";
import Image from "next/image";

import Modal, { ModalProps } from "../ui/Modal";
import Button from "../ui/Button";

// import LogoImg from "@/assets/images/logo.png";
// import CertificateImg from "@/assets/images/certicate.png";
// import RegisterImg from "@/assets/images/register.png";
// import SigninImg from "@/assets/images/signin.png";
// import DashboardImg from "@/assets/images/dashboard.png";
// import CasepresentationImg from "@/assets/images/casepresentation.png";
// import CasecommentsImg from "@/assets/images/casecomments.png";
// import CaseModalAnswerImg from "@/assets/images/casemodelanswer.png";
// import CaseTeachingImg from "@/assets/images/caseteaching.png";
// import CmeQuestionsImg from "@/assets/images/cmequestionspage.png";
// import FeedbackImg from "@/assets/images/feedback.png";

interface Step {
	step: number;
	title: string;
	description: string;
	image: string;
	alt: string;
}

const stepsData: Step[] = [
	{
		step: 0,
		title: "Welcome",
		description:
			"Welcome to e-Clinical Cases Solutions. Here are the steps to get started.",
		image: "/assets/images/logo.png",
		alt: "e Clinical Cases Solutions logo",
	},
	{
		step: 1,
		title: "Step 1.",
		description:
			"Enter the basic information to start the registration of your new account. You will receive a verification email to complete the registration.",
		image: "/assets/images/register.png",
		alt: "registration image",
	},
	{
		step: 2,
		title: "Step 2.",
		description: "Login in with your verified email address.",
		image: "/assets/images/signin.png",
		alt: "sign in image",
	},
	{
		step: 3,
		title: "Step 3.",
		description:
			'Click on the "View Case" button to review the details of the recently published case.',
		image: "/assets/images/dashboard.png",
		alt: "student dashboard image",
	},
	{
		step: 4,
		title: "Step 4.",
		description:
			"Review the presentation of the current case study. After careful evaluation, proceed to comment on the presentation.",
		image: "/assets/images/casepresentation.png",
		alt: "case presentation image",
	},
	{
		step: 5,
		title: "Step 5.",
		description:
			"Comment on the case study based on the case presentation. Comments must be between 150 and 700 characters.",
		image: "/assets/images/casecomments.png",
		alt: "case comments image",
	},
	{
		step: 6,
		title: "Step 6.",
		description: "Compare your response to the teacher's case model answer.",
		image: "/assets/images/casemodelanswer.png",
		alt: "case model answer image",
	},
	{
		step: 7,
		title: "Step 7.",
		description:
			"Read through the teacher's detailed case teaching on the subject. The teaching also contains additional resources for further learning.",
		image: "/assets/images/caseteaching.png",
		alt: "case teaching image",
	},
	{
		step: 8,
		title: "Step 8.",
		description:
			"Answer all the multiple choice questions correctly to complete the course and earn your certificate.",
		image: "/assets/images/cmequestionspage.png",
		alt: "cme questions image",
	},
	{
		step: 9,
		title: "Step 9.",
		description: "Give your feedback on the case study.",
		image: "/assets/images/feedback.png",
		alt: "feedback image",
	},
	{
		step: 10,
		title: "Step 10.",
		description: "Download your certificate.",
		image: "/assets/images/certicate.png",
		alt: "download certificate image",
	},
];

const WalkthroughModal: FunctionComponent<ModalProps> = ({ show, toggle }) => {
	const [progress, setProgress] = useState(0);
	const totalSteps = stepsData.length - 1;

	const changeSlide = (direction: "previous" | "next") => {
		let nextSlide;
		if (direction === "next") {
			nextSlide = progress >= totalSteps ? 0 : progress + 1;
		} else {
			nextSlide = progress === 0 ? totalSteps : progress - 1;
		}
		setProgress(nextSlide);
	};

	const currentStep = stepsData.find((s) => s.step === progress);

	return (
		<Modal show={show} toggle={toggle} size="lg">
			{/* Current Step Content */}
			{currentStep && (
				<div className="flex flex-col items-center py-16">
					{currentStep.step === 0 && (
						<>
							<figure className="h-6 mb-5">
								<Image
									src={currentStep.image}
									alt={currentStep.alt}
									className="h-full w-auto"
									width={150}
									height={40}
								/>
							</figure>
							<h2 className="text-lg font-medium mt-5 text-dark text-center">
								{currentStep.description}
							</h2>
						</>
					)}
					{currentStep.step > 0 && (
						<>
							<h2 className="text-md sm:text-lg font-medium mt-3 text-dark text-center">
								{currentStep.title}
							</h2>
							<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6 text-center">
								{currentStep.description}
							</p>
							<div className="mt-4">
								<figure className="md:h-auto sm:h-64 h-48">
									<Image
										src={currentStep.image}
										alt={currentStep.alt}
										className="h-full mx-auto"
										width={700}
										height={400}
									/>
								</figure>
							</div>
						</>
					)}
				</div>
			)}

			{/* Navigation Buttons */}
			<div className="flex items-center justify-between mt-4">
				{progress > 0 && (
					<Button
						btnStyle="outline"
						size="md"
						onClick={() => changeSlide("previous")}
					>
						Previous
					</Button>
				)}
				{/* Step Indicators */}
				<ul className="flex items-center space-x-2.5">
					{stepsData.map((stepData) => (
						<li key={stepData.step}>
							<button
								aria-label={`Step ${stepData.step}`}
								onClick={() => setProgress(stepData.step)}
								className={`no-outline h-3 w-3 rounded-full ${
									stepData.step === progress ? "bg-primary-500" : "bg-grey-400"
								}`}
							/>
						</li>
					))}
				</ul>
				{progress < totalSteps && (
					<Button
						btnStyle="basic"
						size="md"
						onClick={() => changeSlide("next")}
					>
						Next
					</Button>
				)}
			</div>
		</Modal>
	);
};

export default WalkthroughModal;
