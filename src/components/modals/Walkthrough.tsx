import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import Image from "next/image";

import Modal, { ModalProps } from "../ui/Modal";
import Button from "../ui/Button";

import LogoImg from "@/assets/images/logo.png";
import certificate from "@/assets/images/certicate.png";
import register from "@/assets/images/register.png";
import signin from "@/assets/images/signin.png";
import dashboard from "@/assets/images/dashboard.png";
import casepresentation from "@/assets/images/casepresentation.png";
import casecomments from "@/assets/images/casecomments.png";
import casemodelanswer from "@/assets/images/casemodelanswer.png";
import caseteaching from "@/assets/images/caseteaching.png";
import cmequestions from "@/assets/images/cmequestionspage.png";
import feedback from "@/assets/images/feedback.png";

const WalkthroughModal: FunctionComponent<ModalProps> = ({ show, toggle }) => {
	const [progress, setProgress] = useState(0);
	const sliderList = useRef<HTMLUListElement>(null);
	let steps = 11;

	const changeSlide = (direction: "previous" | "next") => {
		let nextSlide;
		const changeSlideStep = 11;

		if (direction === "next") {
			nextSlide = progress >= changeSlideStep - 1 ? 0 : progress + 1;
		} else {
			nextSlide = progress === 0 ? changeSlideStep - 1 : progress - 1;
		}
		setProgress(nextSlide);
	};

	const getArrayOfSteps = () => {
		const results = [];
		for (let i = 0; i < steps; steps = -1) results.push(i);
		return results;
	};

	const populateSteps = () => {
		const arrayOfSteps = getArrayOfSteps();
		return arrayOfSteps.map((step) => (
			<li key={step}>
				<button
					aria-label={`${step}`}
					onClick={() => setProgress(step)}
					className={`no-outline h-1.5 w-1.5 rounded-full ${
						step === progress ? "" : "bg-grey-400"
					}`}
				/>
			</li>
		));
	};

	useEffect(() => {
		const listEl = sliderList.current;
		if (listEl) {
			const scrollPosition = listEl.children[0].clientWidth * progress;
			listEl.scrollTo(scrollPosition, 0);
		}
	}, [progress]);

	return (
		<Modal {...{ show, toggle, size: "lg" }}>
			<ul
				className="grid overflow-hidden"
				style={{
					gridTemplateColumns: "repeat(11, 100%)",
					scrollBehavior: "smooth",
				}}
				ref={sliderList}
			>
				<li className="flex flex-col items-center py-16 sm:py-24 md:py-30 mt-20">
					<figure className="h-6">
						<Image src={LogoImg} alt="" className="h-full w-auto" />
					</figure>
					<h2 className="text-lg font-medium mt-5 text-dark text-center">
						Welcome to e-Clinical Cases Solutions
					</h2>
					<p className="text-sm text-dark mt-6 max-w-lg text-center">
						Here are the steps to get started with e-Clinical Cases Solutions.
					</p>
				</li>
				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 1.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Enter the basic information to start registration. You will recieve
						a verification email to activate your account.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={register}
								alt="registration image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 2.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Login in with your verified email address.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={signin}
								alt="sign in image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10 mr-5 ml-5">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 3.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						The most recent case study will be displayed on your dashboard.
						Click on the &quot;View Case&quot; button to view the details.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={dashboard}
								alt="student dashboard image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>
				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 4.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Review the case presentation for the current case. After careful
						evaluation, proceed to comment on the case presentation.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={casepresentation}
								alt="case presentation image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 5.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Comment on the case study based on the case presentation. The
						maximum word count is 700 words.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={casecomments}
								alt="case comments image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 6.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Compare your response to the teacher&apos;s case model answer.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={casemodelanswer}
								alt="case model answer image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 7.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Read through the teachers case teaching on the subject in details.
						The teaching also contains additional resources for further
						learning.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={caseteaching}
								alt="case teaching image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 8.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Answer all the multiple choice questions correctly to complete the
						course and earn your certificate.{" "}
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={cmequestions}
								alt="cme questions image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 9.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Give your feedback on the case study.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={feedback}
								alt="feedback image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>

				<li className="md:flex flex-col justify-self-center py-6 mb-4 mt-10">
					<h2 className="text-md sm:text-lg font-medium mt-3 text-dark">
						Step 10.
					</h2>
					<p className="text-md sm:text-lg text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
						Download your certificate.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={certificate}
								alt="download certificate image"
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>
			</ul>
			<div className="flex items-center justify-between">
				{progress > 0 && (
					<Button
						btnStyle="outline"
						size="sm"
						onClick={() => changeSlide("previous")}
					>
						Previous
					</Button>
				)}
				<ul className="flex items-center space-x-2.5">{populateSteps()}</ul>
				<Button btnStyle="basic" size="sm" onClick={() => changeSlide("next")}>
					Next
				</Button>
			</div>
		</Modal>
	);
};

export default WalkthroughModal;
