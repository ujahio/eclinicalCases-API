"use client";

import React from "react";
import dynamic from "next/dynamic";

const ResponsesAndFeedbackPage = dynamic(
	() => import("@/presentation/doctor/ResponsesAndFeedback"),
	{
		ssr: false,
	}
);

const Page = () => {
	return <ResponsesAndFeedbackPage />;
};

export default Page;
