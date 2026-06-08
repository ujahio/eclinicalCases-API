import { FC } from "react";
import { InputField } from "../form-elements";
import { Button } from "@/components/ui/button";

interface PersonalDetailsSettingsProps {
	isAdmin?: boolean;
}

const PersonalDetailsSettings: FC<PersonalDetailsSettingsProps> = ({
	isAdmin,
}) => {
	return (
		<form>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
				<InputField
					label="First Name"
					name="firstName"
					placeholder="Enter first name"
				/>
				<div>
					<InputField
						label="Last Name"
						name="lastName"
						placeholder="Enter last name"
					/>
				</div>
			</div>
			<InputField
				label="Email Address"
				placeholder="johndoe@email.com"
				name="email"
				type="email"
			/>
			<InputField
				label="Area of expertise"
				placeholder="Enter area of expertise"
				name="areaOfExpertise"
				type="text"
				className={isAdmin ? "hidden" : "block"}
			/>
			<InputField
				label="Professional Titles"
				placeholder="Your Professional Titles e.g Dr, Master"
				name="professionaTitles"
				type="text"
				className={isAdmin ? "hidden" : "block"}
			/>

			<div className="mt-8">
				<Button block>
					Save Changes
					<svg width="12" viewBox="0 0 18.352 14">
						<path
							d="M12.659,22.217,8.307,17.865,6.83,19.341l5.829,5.829L25.182,12.647,23.705,11.17Z"
							transform="translate(-6.83 -11.17)"
							fill="#fff"
						/>
					</svg>
				</Button>
			</div>
		</form>
	);
};

PersonalDetailsSettings.defaultProps = {
	isAdmin: false,
};

export default PersonalDetailsSettings;
