"use client";
import useClickOutside from "@/services/hooks/useClickOutside";
import Link from "next/link";
import { FC, useEffect, useRef, useState } from "react";

type DropdownPosition = "left" | "right";

interface AppDropdownProps {
	children: any;
	className?: string;
	closeOnClick?: boolean;
	position?: DropdownPosition;
}

const AppDropdown = ({
	children,
	className,
	closeOnClick = true,
	position = "right",
}: AppDropdownProps) => {
	const [show, toggle] = useState(false);
	const wrapperRef = useRef() as React.MutableRefObject<any>;
	const dropdownEl = useRef() as React.MutableRefObject<HTMLDivElement>;

	useEffect(() => {
		if (dropdownEl.current) {
			const dropdownParent = dropdownEl.current.parentElement;
			const caretIcon = dropdownParent?.querySelector(".caret-icon");

			if (dropdownParent) {
				// add relative to parent, to make sure dropdown is positioned relatively
				dropdownParent.classList.add("relative");
				wrapperRef.current = dropdownParent;

				const toggleFunction = () => {
					toggle(!show);
					if (caretIcon) {
						caretIcon.classList.toggle("rotate-180");
					}
				};

				dropdownParent.addEventListener("click", toggleFunction);

				// check if dropdown should close when clicked
				if (closeOnClick) {
					const children = dropdownParent.querySelectorAll("button, dt");

					const closeFunction = () => {
						toggle(false);
					};

					children.forEach((child) => {
						child.addEventListener("click", closeFunction);
					});

					// cleanup function
					return () => {
						children.forEach((child) => {
							child.removeEventListener("click", closeFunction);
						});

						dropdownParent.removeEventListener("click", toggleFunction);
					};
				}

				return () =>
					dropdownParent.removeEventListener("click", toggleFunction);
			}
		}
	}, [show, closeOnClick]);

	useClickOutside(wrapperRef, () => {
		toggle(false);
	});

	const stateClasses = () => {
		return show
			? "opacity-1 translate-y-1"
			: "opacity-0 translate-y-3 pointer-events-none";
	};

	return (
		<div
			ref={dropdownEl}
			className={`bg-white overflow-hidden flex flex-col z-999 absolute top-full transition-all duration-150 transform rounded-sm border border-grey-400 border-opacity-40 min-w-62.5 shadow-drop-down ${stateClasses()} ${
				position === "right" ? "right-0" : "left-0"
			} ${className}`}
			style={{ top: "calc(100% + 15px)" }}
		>
			<div className="max-h-60vh overflow-y-auto">
				<ul className="text-left py-2.5">{children}</ul>
			</div>
		</div>
	);
};

interface AppDropdownItemProps {
	children: any;
	href?: string;
	onClick?: (...args: any) => void;
	className?: string;
}

export const AppDropdownItem: FC<AppDropdownItemProps> = (props) => {
	const { href, onClick = () => {}, children, className } = props;
	const itemClasses = `outline-none flex items-center justify-between transition-all w-full text-grey-300 px-3.75 py-2 text-sm hover:font-medium hover:text-dark`;

	return (
		<li className={`cursor-pointer  ${className}`}>
			{href ? (
				<Link href={href}>
					<dt className={itemClasses}>{children}</dt>
					{/* dt: hack to listen to click event, Link el stope the event from propagating */}
				</Link>
			) : (
				<button onClick={onClick} className={itemClasses}>
					{children}
				</button>
			)}
		</li>
	);
};

export default AppDropdown;
