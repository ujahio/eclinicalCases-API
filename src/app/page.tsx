"use client";

import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomeComp from "@/presentation/home";
// import WalkthroughModal from "@/components/modals/Walkthrough";

export default function Home() {
	const [showWelcomeModal, setShowWelcomeModal] = useState(false);

	return (
		<>
			{/* <Navbar setShowWelcomeModal={setShowWelcomeModal} /> */}
			<Navbar />

			<HomeComp />
			<Footer />
			{/* <WalkthroughModal
				show={showWelcomeModal}
				toggle={setShowWelcomeModal}
				size="lg"
			/> */}
		</>
	);
}
