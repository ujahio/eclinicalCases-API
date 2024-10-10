import React, { FC } from "react";

export interface ModalProps {
	show: boolean;
	toggle: (state: boolean) => void;
	size?: "sm" | "md" | "lg";
	children?: any;
	caseId?: any;
	studentInfo?: any;
}

const Modal: FC<ModalProps> = ({ show, toggle, size = "md", children }) => {
	let addedClasses = "";

	switch (size) {
		case "sm":
			addedClasses += " top-1/6 max-w-120";
			break;
		case "md":
			addedClasses += " top-1/2 transform -translate-y-1/2 max-w-150";
			break;
		default:
			addedClasses += " top-1/2 transform -translate-y-1/2 max-w-225";
			break;
	}

	return (
		<div
			className={`bg-dark bg-opacity-70 fixed top-0 left-0 right-0 bottom-0 z-50 transform duration-200 ease-in-out flex justify-center items-start ${
				show
					? "opacity-1 pointer-events-auto scale-100"
					: "pointer-events-none opacity-0 scale-95"
			}`}
			style={{ backdropFilter: "blur(3px)" }}
		>
			<div
				className={`bg-white w-11/12 rounded-sm p-6 sm:p-7 md:p-8 relative ${addedClasses}`}
			>
				<button
					onClick={() => toggle(false)}
					className="no-outline h-3.5 w-3.5 absolute top-4 right-5 md:top-5 transition-all text-dark hover:text-primary-300"
				>
					<svg width="100%" viewBox="0 0 19.528 19.529">
						<g transform="translate(-314.611 -73.746)">
							<line
								y2="25.617"
								transform="translate(333.432 74.454) rotate(45)"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							/>
							<line
								y2="25.617"
								transform="translate(315.318 74.454) rotate(-45)"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							/>
						</g>
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
};

export default Modal;
