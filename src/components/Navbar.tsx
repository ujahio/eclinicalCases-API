import Image from "next/image";
import Link from "next/link";
import { APP_CONTAINER, LANDING_X_PADDING } from "@/services/constants/styles";
import Button from "./ui/Button";
import AppDropdown, { AppDropdownItem } from "./ui/Dropdown";

// const Navbar = ({ setShowWelcomeModal }) => {
const Navbar = ({
	activeTab,
	setShowWelcomeModal,
}: {
	activeTab: string;
	setShowWelcomeModal: (bool: boolean) => void;
}) => {
	const homePageActiveIndicator = activeTab === "home" ? "active" : "";
	const facultyPageActiveIndicator = activeTab === "faculty" ? "active" : "";

	return (
		<div
			className={`flex items-center justify-between bg-white shadow-sm navbar h-17.5 ${LANDING_X_PADDING}`}
		>
			<div
				className={`w-full flex items-center justify-between bg-white shadow-sm navbar h-17.5 ${LANDING_X_PADDING} ${APP_CONTAINER}`}
			>
				<Image
					src="/images/logo.png"
					width={150}
					height={35}
					alt="e clinical cases solutions logo"
					className="w-auto h-5 sm:h-6"
				/>
				<ul className="text-dark md:flex hidden h-full items-center space-x-5 md:space-x-8">
					<li className="h-full relative inline-flex items-center">
						<Link href="/" className={`${homePageActiveIndicator} uppercase`}>
							Home
						</Link>
					</li>
					<li className="h-full relative inline-flex items-center">
						<Link
							href="/faculty"
							className={`${facultyPageActiveIndicator} uppercase`}
						>
							FACULTY
						</Link>
					</li>
					<li
						className="h-full relative inline-flex items-center uppercase cursor-pointer"
						onClick={() => setShowWelcomeModal(true)}
					>
						How it works
					</li>
				</ul>
				<div className="hidden md:flex">
					<Button href="/login" className="mr-3 " btnStyle="outline" size="md">
						Log in
					</Button>
					<Button href="/signup" size="md">
						get started
					</Button>
				</div>
				<div className="md:hidden">
					<button className="outline-none focus:outline-none">
						<div className=" w-6 sm:w-7 mb-1 h-0.5 bg-grey-300" />
						<div className=" w-6 sm:w-7 mb-1 h-0.5 bg-grey-300" />
						<div className=" w-6 sm:w-7 h-0.5 bg-grey-300" />

						<AppDropdown>
							<AppDropdownItem href="/login" className="uppercase">
								Log in
							</AppDropdownItem>
							<AppDropdownItem href="/signup" className="uppercase">
								Get started
							</AppDropdownItem>
						</AppDropdown>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
