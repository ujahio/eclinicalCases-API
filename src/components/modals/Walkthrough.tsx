import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import Image from "next/image";

import Modal, { ModalProps } from "../ui/Modal";
import Button from "../ui/Button";

import LogoImg from "@/assets/images/logo.png";
import screen from "@/assets/images/screen-1.svg";
import register from "@/assets/images/register.png";
import signin from "@/assets/images/signin.png";
import dashboard from "@/assets/images/dashboard.png";
import casepresentation from "@/assets/images/casepresentation.png";
import caseresponse from "@/assets/images/caseresponse.png";
import casemodelanswer from "@/assets/images/casemodelanswer.png";

const WalkthroughModal: FunctionComponent<ModalProps> = ({ show, toggle }) => {
	const [progress, setProgress] = useState(0);
	const sliderList = useRef<HTMLUListElement>(null);
	let steps = 10;

	const changeSlide = (direction: "previous" | "next") => {
		let nextSlide;
		const changeSlideStep = 10;

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
						step === progress ? "bg-dark" : "bg-grey-400"
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
					gridTemplateColumns: "repeat(10, 100%)",
					scrollBehavior: "smooth",
				}}
				ref={sliderList}
			>
				<li className="flex flex-col items-center py-16 sm:py-24 md:py-30">
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
				{/* template li */}
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
								alt=""
								className="h-full mx-auto"
								width={700}
							/>
						</figure>
					</div>
				</li>
				{/* rest of the li elements */}
				{/* <li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image
							src={signin}
							alt=""
							className="h-full mx-auto"
							width={1100}
						/>
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 2
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Login in with your verified email address.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image
							src={dashboard}
							alt=""
							className="h-full mx-auto"
							width={1500}
							// height={1000}
						/>
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 3
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							The most recent ongoing case study will be displayed on your
							dashboard. Click on the &quot;View Case&quot; button to view the
							details.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={casepresentation} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 4
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Review the case presentation for the ongoing case study. After
							careful evaluation, click on &quot;Proceed to the Case Model
							Question&quot; to respond to the case presentation.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={caseresponse} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 5
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Give a response to the case study based on the case presentation.
							The max count is 700 words.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={casemodelanswer} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 6
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Compare your answers to the teacher&apos;s case model answer.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={screen} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 7
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							In order to get a certificate, you must score a 100% on the CME
							Questions. You can retake the test as many times as you want.
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={screen} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 8
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Give feedback on the course and download the certificate
						</p>
					</div>
				</li>
				<li className="md:flex py-16 sm:py-10 justify-self-center">
					<figure className="md:h-auto sm:h-64 h-48">
						<Image src={screen} alt="" className="h-full mx-auto" />
					</figure>
					<div className="ml-3">
						<h2 className="text-md sm:text-lg font-medium mt-4 md:mt-14 text-dark">
							Step 9
						</h2>
						<p className="text-xs sm:text-sm text-dark mt-3 max-w-lg tracking-wider sm:leading-7 leading-6">
							Give feedback on the course and download the certificate
						</p>
					</div>
				</li> */}

				{/* Refactored li elements */}
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
								alt=""
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
						The most recent ongoing case study will be displayed on your
						dashboard. Click on the "View Case" button to view the details.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={dashboard}
								alt=""
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
						Review the case presentation for the ongoing case study. After
						careful evaluation, click on "Proceed to the Case Model Question" to
						respond to the case presentation.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={casepresentation}
								alt=""
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
						Give a response to the case study based on the case presentation.
						The max count is 700 words.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={caseresponse}
								alt=""
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
						Compare your answers to the teacher's case model answer.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={casemodelanswer}
								alt=""
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
						In order to get a certificate, you must score a 100% on the CME
						Questions. You can retake the test as many times as you want.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={screen}
								alt=""
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
						Give feedback on the course and download the certificate.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={screen}
								alt=""
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
						Give feedback on the course and download the certificate.
					</p>
					<div className="mt-4">
						<figure className="md:h-auto sm:h-64 h-48">
							<Image
								src={screen}
								alt=""
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
