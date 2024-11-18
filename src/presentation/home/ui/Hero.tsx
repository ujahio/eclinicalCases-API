import React from "react";
import Button from "@/components/ui/Button";
import FemaleAssistantImg from "@/assets/images/femaleassistant.png";
import MaleDoctorImg from "@/assets/images/maledoctor.png";
import FemaleDoctorImg from "@/assets/images/femaledoctor.png";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
	return (
		<div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-xxl 3xl:max-w-3xl mx-auto">
			<div className="mt-16 md:mt-28 grid grid-cols-1 sm:grid-cols-2 gap-8 header px-6.25 sm:px-10 md:px-15 lg:px-25">
				<div className="lg:w-10/12 tracking-wider">
					<p className="text-darker font-bold text-3xl leading-snug">
						Welcome to e-Clinical Cases Solutions
					</p>
					<p className="mt-8 text-dark leading-5">
						e-Clinical Cases Solutions aim to provide category 1 CME in
						laboratory medicine as interactive clinical cases online. It is
						suitable for learning for all laboratorians, endocrinologists,
						rheumatologists, nurses, family and internal medicine physicians,
						and all users of the clinical laboratory. The cases are authentic,
						acquired over 20 years of clinical practice. Cases can be accessed
						online anywhere, and at any time.
						<br />
						<br />
						Cases will be posted fortnightly. Registered participants earn 1
						category 1 CME point per case. Learning is active as participants
						consider and comment on the case and compare answers to a model
						answer by the tutor. This is accompanied by teaching on the subject
						and a test of learning by multiple choice questions (MCQs).
						<br />
						<br />A total of 20 category 1 CMEs are offered in one year.
						<br />
						<br />
						NMC Healthcare is accredited by the Abu Dhabi Department of Health
						to provide CME/CPD for healthcare providers. This activity is
						designated for XXXX CME/CPD credits.
					</p>
					<Link href="/signup">
						<Button className="sm:mt-16 mt-8" size="lg">
							GET STARTED
						</Button>
					</Link>
				</div>
				<div className="mt-6 md:mt-0 w-auto header-images">
					<figure className="header-img header-img-1">
						<Image
							src={FemaleAssistantImg}
							alt="female assistant"
							className="w-full"
						/>
					</figure>
					<figure className="header-img header-img-2">
						<Image src={MaleDoctorImg} alt="" className="w-full" />
					</figure>
					<figure className="header-img header-img-3">
						<Image src={FemaleDoctorImg} alt="" className="w-full" />
					</figure>
				</div>
			</div>
		</div>
	);
};

export default Header;
