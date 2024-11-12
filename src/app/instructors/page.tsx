"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import maskedTeacher from "@/assets/images/masked-doctor.png";
import { APP_CONTAINER, LANDING_X_PADDING } from "@/services/constants/styles";

const Page = () => {
	return (
		<div className="bg-primary-100">
			<div
				className={`sm:mt-32 mt-24 py-15 sm:py-32 sm:grid grid-cols-2 ${LANDING_X_PADDING} ${APP_CONTAINER}`}
			>
				<div>
					<Image src={maskedTeacher} alt="" className=" w-full" />
				</div>
				<div className="mt-12 sm:mt-0 md:ml-10 sm:ml-10 lg:ml-28 max-w-sm">
					<p className="text-darker font-bold text-3xl">About Instructor</p>
					<h3>Dr Emmanuel earned his degree from ...</h3>
				</div>
			</div>
		</div>
	);
};

export default Page;
