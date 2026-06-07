import { FC } from "react";

interface CheckBoxProps {
	children: any;
	name: string;
	isChecked?: boolean;
	onChange: (value: boolean) => void;
}

const CheckBox: FC<CheckBoxProps> = ({
	children,
	onChange,
	isChecked = false,
	name,
}) => {
	return (
		<label htmlFor={name} className="cursor-pointer inline-flex items-center">
			<input
				type="checkbox"
				className="hidden"
				onChange={(e) => onChange(e.target.checked)}
				name={name}
				id={name}
			/>
			<span
				role="button"
				className={`outline-none focus:outline-none border-0.375 rounded-sm h-3.75 w-3.75 inline-flex items-center justify-center transition-colors duration-150 ${
					isChecked
						? "bg-primary-300 border-primary-300"
						: "bg-neutral-200 border-grey-200"
				}`}
			>
				<svg
					width="80%"
					viewBox="0 0 18.006 12.373"
					className={`transition-opacity duration-150 ${isChecked ? "opacity-1" : "opacity-0"}`}
				>
					<path
						d="M-15890.717,19582.234l6.221,5.416,10.426-10.3"
						transform="translate(15891.373 -19576.641)"
						fill="none"
						stroke="#ffffff"
						strokeWidth="2"
					/>
				</svg>
			</span>
			{children}
		</label>
	);
};

export default CheckBox;
