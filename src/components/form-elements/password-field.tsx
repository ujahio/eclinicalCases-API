import { FC, useState } from "react";
import InputField, { InputFieldInterface } from "./input-field";

const PasswordField: FC<InputFieldInterface> = ({ ...props }) => {
	const [type, setType] = useState("password");

	const changeType = () => {
		if (type === "password") {
			setType("text");
		} else {
			setType("password");
		}
	};

	return (
		<InputField {...props} type={type}>
			<button
				className="no-outline text-dark uppercase font-medium text-xs absolute right-3-75 sm:right-4"
				onClick={() => changeType()}
				type="button"
			>
				{type === "text" ? "hide" : "show"}
			</button>
		</InputField>
	);
};

export default PasswordField;
