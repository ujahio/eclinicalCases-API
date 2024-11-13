import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/assets/images/logo.png";

const Footer = () => {
	return (
		<div className="bg-white">
			<div className="py-20 text-grey-300 sm:grid grid-cols-6 sm:text-xs lg:text-sm px-6.25 sm:px-10 md:px-15 lg:px-25 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-xxl 3xl:max-w-3xl mx-auto">
				<div className="sm:grid grid-cols-3 col-span-4">
					<div>
						<Image src={Logo} alt="" className="sh-5 sm:h-6" />
						<p className="mt-6">e-clinical cases solution © 2024</p>
					</div>
					{/* <ul className="sm:ml-8 mt-10 sm:mt-0 space-y-4">
						<li>
							<Link href="">Disclaimer</Link>
						</li>
						<li>
							<Link href="">Privacy Statement</Link>
						</li>
						<li>
							<Link href="">Patient Bill of Rights</Link>
						</li>
					</ul>
					<ul className="mt-8 sm:mt-0 sm:ml-8 space-y-4">
						<li>
							<Link href="">Legal Information</Link>
						</li>
						<li>
							<Link href="">Notice of nondiscrimination</Link>
						</li>
						<p>Need help?</p>
					</ul> */}
				</div>
				{/* <div className="sm:ml-20 lg:ml-48 col-span-2 mt-10 sm:mt-0">
					<p>Connect with us</p>
					<ul className="flex mt-4">
						{socialLinks.map(({ href, icon }, index) => (
							<li key={`key${index}`}>
								<a
									href={href}
									className="text-dark transition-colors hover:text-primary-300 cursor-pointer"
								>
									{icon}
								</a>
							</li>
						))}
					</ul>
				</div> */}
			</div>
		</div>
	);
};

// const socialLinks = [
// 	{
// 		href: "",
// 		icon: (
// 			<svg
// 				xmlns="http://www.w3.org/2000/svg"
// 				width="8.891"
// 				height="25"
// 				viewBox="0 0 12.891 25"
// 				className="sm:mr-5 mr-12"
// 			>
// 				<path
// 					d="M3.745,25V13.818H0V9.375H3.745v-3.5C3.745,2.07,6.069,0,9.463,0a31.442,31.442,0,0,1,3.428.176V4.15H10.537c-1.846,0-2.2.879-2.2,2.163V9.375H12.5l-.571,4.443H8.335V25"
// 					fill="currentColor"
// 				/>
// 			</svg>
// 		),
// 	},
// 	{
// 		href: "",
// 		icon: (
// 			<svg
// 				xmlns="http://www.w3.org/2000/svg"
// 				width="22.781"
// 				height="25"
// 				viewBox="0 0 30.781 25"
// 				className="sm:mr-5 mr-12"
// 			>
// 				<path
// 					d="M27.617,54.312c.02.273.02.547.02.82,0,8.34-6.348,17.949-17.949,17.949A17.828,17.828,0,0,1,0,70.25a13.051,13.051,0,0,0,1.523.078,12.634,12.634,0,0,0,7.832-2.7,6.32,6.32,0,0,1-5.9-4.375,7.955,7.955,0,0,0,1.191.1,6.672,6.672,0,0,0,1.66-.215A6.309,6.309,0,0,1,1.25,56.949v-.078a6.353,6.353,0,0,0,2.852.8,6.318,6.318,0,0,1-1.953-8.437,17.932,17.932,0,0,0,13.008,6.6A7.122,7.122,0,0,1,15,54.391a6.315,6.315,0,0,1,10.918-4.316,12.421,12.421,0,0,0,4-1.523,6.292,6.292,0,0,1-2.773,3.477,12.647,12.647,0,0,0,3.633-.977A13.561,13.561,0,0,1,27.617,54.312Z"
// 					transform="translate(0 -48.082)"
// 					fill="currentColor"
// 				/>
// 			</svg>
// 		),
// 	},
// 	{
// 		href: "",
// 		icon: (
// 			<svg
// 				xmlns="http://www.w3.org/2000/svg"
// 				width="18.005"
// 				height="25"
// 				viewBox="0 0 25.005 25"
// 				className="sm:mr-5 mr-12"
// 			>
// 				<path
// 					d="M12.431,37.915a6.41,6.41,0,1,0,6.41,6.41A6.4,6.4,0,0,0,12.431,37.915Zm0,10.577A4.167,4.167,0,1,1,16.6,44.325a4.175,4.175,0,0,1-4.167,4.167ZM20.6,37.653a1.5,1.5,0,1,1-1.5-1.5A1.492,1.492,0,0,1,20.6,37.653Zm4.245,1.517a7.4,7.4,0,0,0-2.019-5.238,7.447,7.447,0,0,0-5.238-2.019c-2.064-.117-8.251-.117-10.315,0a7.436,7.436,0,0,0-5.238,2.014A7.423,7.423,0,0,0,.013,39.165C-.1,41.229-.1,47.415.013,49.48a7.4,7.4,0,0,0,2.019,5.238A7.457,7.457,0,0,0,7.27,56.737c2.064.117,8.251.117,10.315,0a7.4,7.4,0,0,0,5.238-2.019,7.447,7.447,0,0,0,2.019-5.238C24.96,47.415,24.96,41.235,24.843,39.17ZM22.176,51.694A4.219,4.219,0,0,1,19.8,54.071c-1.646.653-5.551.5-7.369.5s-5.729.145-7.369-.5a4.219,4.219,0,0,1-2.376-2.376c-.653-1.646-.5-5.551-.5-7.369s-.145-5.729.5-7.369a4.219,4.219,0,0,1,2.376-2.376c1.646-.653,5.551-.5,7.369-.5s5.729-.145,7.369.5a4.219,4.219,0,0,1,2.376,2.376c.653,1.646.5,5.551.5,7.369S22.829,50.054,22.176,51.694Z"
// 					transform="translate(0.075 -31.825)"
// 					fill="currentColor"
// 				/>
// 			</svg>
// 		),
// 	},
// 	{
// 		href: "",
// 		icon: (
// 			<svg
// 				xmlns="http://www.w3.org/2000/svg"
// 				width="25.556"
// 				height="25"
// 				viewBox="0 0 35.556 25"
// 			>
// 				<path
// 					id="FontAwesome_youtube"
// 					data-name="FontAwesome youtube"
// 					d="M49.746,67.912A4.468,4.468,0,0,0,46.6,64.748C43.829,64,32.711,64,32.711,64s-11.118,0-13.891.748a4.468,4.468,0,0,0-3.143,3.164c-.743,2.791-.743,8.614-.743,8.614s0,5.823.743,8.614a4.4,4.4,0,0,0,3.143,3.113C21.592,89,32.711,89,32.711,89s11.118,0,13.891-.748a4.4,4.4,0,0,0,3.143-3.113c.743-2.791.743-8.614.743-8.614S50.489,70.7,49.746,67.912Zm-20.671,13.9V71.239l9.293,5.287Z"
// 					transform="translate(-14.933 -64)"
// 					fill="currentColor"
// 				/>
// 			</svg>
// 		),
// 	},
// ];

export default Footer;
