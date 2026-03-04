"use client";

import { useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HomeComp from "@/presentation/home";
import WalkthroughModal from "@/components/modals/Walkthrough";

export default function Home() {
	const [showWelcomeModal, setShowWelcomeModal] = useState(false);

	return (
		<>
			<Navbar setShowWelcomeModal={setShowWelcomeModal} activeTab="home" />

			<HomeComp />
			<Footer />
			<WalkthroughModal
				show={showWelcomeModal}
				toggle={setShowWelcomeModal}
				size="lg"
			/>
		</>
	);
}
