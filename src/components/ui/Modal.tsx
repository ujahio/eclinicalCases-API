import { FC, ReactNode } from "react";

export interface ModalProps {
	show: boolean;
	toggle: (state: boolean) => void;
	size?: "sm" | "md" | "lg";
	children?: ReactNode;
	caseId?: any;
	studentInfo?: any;
}

const Modal: FC<ModalProps> = ({ show, toggle, size = "md", children }) => {
	let addedClasses = "";

	switch (size) {
		case "sm":
			addedClasses += " max-w-lg";
			break;
		case "md":
			addedClasses += " max-w-2xl";
			break;
		default:
			addedClasses += " max-w-4xl";
			break;
	}

	return (
		<div
			className={`bg-dark bg-opacity-70 fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center transition-opacity duration-200 ease-in-out ${
				show
					? "opacity-100 pointer-events-auto"
					: "opacity-0 pointer-events-none"
			}`}
			style={{ backdropFilter: "blur(3px)" }}
		>
			<div
				className={`bg-white w-11/12 rounded-sm p-6 sm:p-7 md:p-8 relative ${addedClasses} flex flex-col overflow-y-auto max-h-screen`}
			>
				<button
					onClick={() => toggle(false)}
					className="no-outline h-6 w-6 absolute top-4 right-5 md:top-5 md:right-6 transition-all text-dark hover:text-primary-300 focus:outline-none"
					aria-label="Close Modal"
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
				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
};
export default Modal;
