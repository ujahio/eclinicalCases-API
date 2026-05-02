import { FC } from "react";

export interface InputFieldInterface extends React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> {
	label: string;
	name: string;
	placeholder: string;
	error?: string;
}

const InputField: FC<InputFieldInterface> = ({
	label,
	name,
	error,
	className = "",
	children,
	...props
}) => {
	return (
		<div className={`flex flex-col first:mt-0 mt-5 ${className}`}>
			{label !== "" && (
				<label
					htmlFor={name}
					className="mb-2 lg:mb-0.625 text-grey-300 text-1sm capitalize font-normal inline-block mt-1.5"
				>
					{label}
				</label>
			)}
			<div className="relative h-11-25 sm:h-12-5 flex items-center">
				<input
					{...props}
					className={`rounded-md h-full w-full border outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder-grey-200 text-1sm text-dark focus:placeholder-opacity-70 transition-all duration-100 px-3.75 sm:px-4 py-5 ${
						error
							? "focus:border-red border-red"
							: "focus:border-lightBlue border-grey-border"
					}`}
					id={name}
				/>
				{children}
			</div>
			<p className="mt-0.625 font-light text-xxs text-red">{error && error}</p>
		</div>
	);
};

export default InputField;
