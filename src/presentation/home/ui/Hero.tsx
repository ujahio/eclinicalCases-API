import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui-custom/button";

const Header = () => {
	return (
		<div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-xxl 3xl:max-w-3xl mx-auto">
			<div className="mt-16 md:mt-28 grid grid-cols-1 sm:grid-cols-2 gap-8 header px-6.25 sm:px-10 md:px-15 lg:px-25">
				<div className="lg:w-10/12 tracking-wider">
					<p className="text-darker font-bold text-3xl leading-snug">
						Welcome to e-Clinical Cases Solutions
					</p>
					<p className="mt-8 text-dark leading-5">
						e-Clinical Cases Solutions aims to provide category 1 CME in
						laboratory medicine in the format of interactive clinical cases
						online. It is suitable for learning for all laboratorians,
						endocrinologists, rheumatologists, nurses, family and internal
						medicine physicians, and all users of the clinical laboratory. The
						cases are authentic, acquired over 20 years of clinical practice.
						Cases can be accessed online anywhere, and at any time.
						<br />
						<br />
						Cases will be posted fortnightly. Registered participants earn 1
						category 1 CME point per case. Learning is active as participants
						consider and comment on the case and compare answers to a model
						answer by the tutor. This is accompanied by a comprehensive teaching
						on the subject and a test of learning by multiple choice questions
						(MCQs).
						<br />
						<br />
						A total of 20 category 1 CME points are offered in one year.
						<br />
						<br />
						NMC Healthcare is accredited by the Abu Dhabi Department of Health
						to provide CME/CPD for healthcare providers. This activity is
						designated for 1 CME/CPD credit per case.
					</p>
					<Link href="/signup">
						<Button className="sm:mt-16 mt-8" size="lg">
							GET STARTED
						</Button>
					</Link>
				</div>
				<div className="mt-6 md:mt-0 w-auto header-images grid grid-cols-1 sm:grid-cols-2 gap-4">
					<figure className="header-img header-img-1">
						<Image
							src="/images/femaledoctor.png"
							alt="female doctor"
							className="w-full"
							width={386}
							height={384}
						/>
					</figure>
					<figure className="header-img header-img-2">
						<Image
							src="/images/maledoctor4.jpg"
							alt="male doctor"
							className="w-full"
							width={664}
							height={1000}
						/>
					</figure>
					<figure className="header-img header-img-3">
						<Image
							src="/images/femaleassistant.png"
							alt="female lab assistant"
							className="w-full"
							width={525}
							height={261}
						/>
					</figure>
				</div>
			</div>
		</div>
	);
};

export default Header;
