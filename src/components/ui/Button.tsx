import Link from "next/link";
import React from "react";

interface ButtonInterface extends React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> {
	href?: string;
	btnStyle?: "basic" | "outline-white" | "outline" | "white";
	size?: "sm" | "md" | "lg";
	centralize?: boolean;
	block?: boolean;
}

const Button: React.FC<ButtonInterface> = ({
	children,
	href,
	btnStyle,
	size,
	centralize,
	block,
	className,
	...props
}) => {
	let classes = `rounded-md outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-100 flex items-center uppercase relative font-medium group ${
		centralize ? "justify-center" : "justify-between"
	} ${block ? "w-full" : ""} ${className} ${
		props.disabled ? "opacity-50 cursor-not-allowed" : ""
	}`;

	switch (btnStyle) {
		case "outline-white":
			classes += ` bg-white text-dark border border-grey-200 hover:bg-grey-100`;
			break;
		case "outline":
			classes += ` text-dark border-0.375 border-grey-200 bg-grey-200 bg-opacity-0 hover:bg-opacity-10`;
			break;
		case "white":
			classes += ` bg-white text-dark bg-opacity-100 hover:bg-opacity-90`;
			break;
		default:
			classes += ` bg-dark text-white hover:bg-primary-300 hover:shadow-primary-btn`;
	}

	switch (size) {
		case "sm":
			classes += " h-7.5 sm:h-8.75 px-3 sm:px-4.5 text-xs";
			break;
		case "md":
			classes += " h-8 sm:h-10 px-5 sm:px-6 text-1xs";
			break;
		default:
			classes += " h-10 sm:h-12.5 px-6 sm:px-7.5 text-1xs";
	}

	return (
		<>
			{href ? (
				<Link href={href} className={classes}>
					{children}
				</Link>
			) : (
				<button {...props} className={classes}>
					{children}
				</button>
			)}
		</>
	);
};

export default Button;
