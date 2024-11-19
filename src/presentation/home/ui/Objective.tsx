import React from "react";
import maskedTeacher from "@/assets/images/masked-doctor.png";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { APP_CONTAINER, LANDING_X_PADDING } from "@/services/constants/styles";
import Link from "next/link";

const Objective = () => {
	return (
		<div className="bg-primary-100">
			<div
				className={`sm:mt-32 mt-24 py-15 sm:py-32 sm:grid grid-cols-2 ${LANDING_X_PADDING} ${APP_CONTAINER}`}
			>
				<div>
					<Image src={maskedTeacher} alt="male lab tech" className=" w-full" />
				</div>
				<div className="mt-12 sm:mt-0 md:ml-10 sm:ml-10 lg:ml-28 max-w-sm">
					<p className="text-darker font-bold text-3xl">Objectives</p>
					<ul className="flex flex-col">
						{objectives.map((objective, ind) => (
							<li className="flex" key={ind}>
								<svg
									id="noun_Check_1635228"
									xmlns="http://www.w3.org/2000/svg"
									width="26.354"
									height="22.473"
									viewBox="0 0 26.354 22.473"
									className="mt-6 mr-3"
								>
									<g id="Group_811" data-name="Group 811">
										<path
											id="Path_8499"
											data-name="Path 8499"
											d="M0,11.678c.543-1.086,1.629-2.444,3.531-1.9,1.629.543,2.716,2.173,3.531,4.345C13.579,6.789,19.01,1.629,25.528,0c.815,0,1.086,0,.543.543A66.231,66.231,0,0,0,6.789,22.269a.509.509,0,0,1-.815,0c-1.086-2.716-1.9-5.432-3.259-8.147C2.173,12.764,1.358,11.678,0,11.678Z"
											fill="#8b98a7"
											fillRule="evenodd"
										/>
									</g>
								</svg>
								<p className="mt-5 leading-6 text-dark tracking-wider">
									{objective}
								</p>
							</li>
						))}
					</ul>

					<Link href="/signup">
						<Button className="mt-12" size="lg">
							Get started
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

const objectives = [
	"To provide category 1 CMEs in clinical laboratory medicine.",
	"To support users of the clinical laboratory better interpret their patients’ test reports.",
	"To provide users with CMEs for accreditation and re-licensing.",
];

export default Objective;
