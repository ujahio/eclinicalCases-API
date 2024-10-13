import React, { FunctionComponent } from "react";
import { useRouter } from "next/navigation";
import AppDropdown, { AppDropdownItem } from "../../ui/Dropdown";
import Logo from "@/assets/images/logo.png";
import UserImg from "@/assets/images/user.png";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { APP_CONTAINER, APP_SPACING } from "@/services/constants/styles";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { logout } from "@/store/slices/auth/loginSlice";

interface NavProps {
	navLinks?: { path: string; label: string }[];
	img?: any;
	name?: string;
	children?: any;
}

const Nav: FunctionComponent<NavProps> = ({
	children,
	navLinks = [
		{
			label: "Dashboard",
			path: "/student/dashboard",
		},
		{
			label: "Certifications",
			path: "/student/certificates",
		},
	],
	img,
}) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const currentPath = usePathname();
	const userInfo = useAppSelector((state) => state.login.user);

	const pathMatches = (path: string) => {
		return currentPath === path;
	};

	const logoutUser = async () => {
		dispatch(logout());
		router.push("/login");
	};

	return (
		<nav className=" w-full bg-white border-b sticky top-0 border-grey-400 border-opacity-40 z-50">
			<div
				className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-xxl 3xl:max-w-3xl flex items-center justify-between h-17.5 ${APP_SPACING} ${APP_CONTAINER}`}
			>
				<Link href="/home">
					<Image src={Logo} alt="E Clinic Logo" className="h-5 sm:h-6 w-auto" />
				</Link>

				<ul className="h-full hidden sm:flex items-center space-x-6.25 md:space-x-8">
					{navLinks.map(({ label, path }, index) => (
						<li
							className="h-full relative items-center inline-flex"
							key={index}
						>
							<Link
								href={path}
								className={`text-sm uppercase font-medium transition ${
									pathMatches(path) ? "nav-active text-dark" : "text-grey-300"
								}`}
							>
								{label}
							</Link>
						</li>
					))}
				</ul>

				<div className="flex items-center cursor-pointer" role="button">
					<figure className=" h-6.25 w-6.25 sm:h-8.75 sm:w-8.75 rounded-full">
						<Image src={UserImg} alt="" className="h-full w-full" />
					</figure>
					<span className="text-dark text-sm inline-block mx-2.5 font-medium">
						{userInfo?.user?.user_role === "teacher"
							? userInfo?.user?.email
							: userInfo?.user?.email}
					</span>
					<svg
						width="10.591"
						height="6"
						viewBox="0 0 10.591 6"
						className="mt-0.5 caret-icon"
					>
						<path
							d="M18.9,13.714,14.807,17.8l-4.089-4.089a.707.707,0,1,0-1,1L14.305,19.3a.714.714,0,0,0,1,0L19.9,14.714a.707.707,0,0,0-1-1Z"
							transform="translate(-9.512 -13.508)"
							fill="#394a5d"
						/>
					</svg>
					{navLinks.map(({ label, path }, index) => (
						<AppDropdown key={index}>
							{currentPath === "/home" ? (
								<AppDropdownItem href={path} className="block sm:hidden">
									{label}
								</AppDropdownItem>
							) : (
								<AppDropdownItem href="/home" className="block sm:hidden">
									Dashboard
								</AppDropdownItem>
							)}
							<AppDropdownItem
								href={
									userInfo?.user?.user_role === "teacher"
										? "/doctor/settings"
										: "/student/settings"
								}
							>
								Account Settings
							</AppDropdownItem>
							<AppDropdownItem
								onClick={() => {
									logoutUser();
								}}
							>
								Sign Out
							</AppDropdownItem>
						</AppDropdown>
					))}
				</div>
			</div>
			{children}
		</nav>
	);
};

export default Nav;
