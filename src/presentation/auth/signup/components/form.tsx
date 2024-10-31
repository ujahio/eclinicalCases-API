import React, {
	FunctionComponent,
	FormEvent,
	useState,
	ChangeEvent,
} from "react";
import Button from "@/components/ui/Button";
import { InputField, PasswordField } from "@/components/form-elements";
import { saltAndHashPassword } from "@/utils/password";
import { toast } from "react-toastify";

// TODO: ADD EMAIL VALIDATION USING ZOD!!!!!

export interface PersonalDetailsProps {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

type SignUpFormProps = {
	switchByKey: (key: string) => void;
	caputurePersonalDetails: (personalDetails: PersonalDetailsProps) => void;
};

export const SignUpForm: FunctionComponent<SignUpFormProps> = ({
	// switchByKey,
	// caputurePersonalDetails,
	handleSignUp,
}) => {
	const [personalDetails, setPersonalDetails] = useState<PersonalDetailsProps>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const submitForm = (e: FormEvent) => {
		e.preventDefault();
		console.log("personalDetails", personalDetails);

		if (personalDetails.password === personalDetails.confirmPassword) {
			const hashedPassword = saltAndHashPassword(personalDetails.password);
			const updatedDetails = {
				...personalDetails,
				password: hashedPassword,
				confirmPassword: hashedPassword,
			};
			handleSignUp(updatedDetails);
			// caputurePersonalDetails(updatedDetails);
			// switchByKey("professional_details");
		} else {
			toast.error("Passwords do not match");
		}
	};

	const captureFirstName = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setPersonalDetails({
			...personalDetails,
			firstName: e.currentTarget.value,
		});
	};

	const captureLastName = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setPersonalDetails({ ...personalDetails, lastName: e.currentTarget.value });
	};

	const captureEmail = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setPersonalDetails({ ...personalDetails, email: e.currentTarget.value });
	};

	const capturePassword = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setPersonalDetails({ ...personalDetails, password: e.currentTarget.value });
	};

	const captureConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setPersonalDetails({
			...personalDetails,
			confirmPassword: e.currentTarget.value,
		});
	};

	return (
		<form onSubmit={submitForm} className="mt-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
				<InputField
					label="First Name"
					name="firstName"
					placeholder="Enter first name"
					onChange={captureFirstName}
					required
				/>
				<div>
					<InputField
						label="Last Name"
						name="lastName"
						placeholder="Enter last name"
						onChange={captureLastName}
						required
					/>
				</div>
			</div>
			<InputField
				label="Email Address"
				placeholder="Enter your email"
				name="email"
				type="email"
				onChange={captureEmail}
				required
			/>
			<PasswordField
				label="Password"
				placeholder="Enter your password"
				name="password"
				onChange={capturePassword}
				required
			/>
			<PasswordField
				label="Confirm Password"
				placeholder="Enter your password"
				name="confirmPassword"
				onChange={captureConfirmPassword}
				required
			/>

			<div className="mt-8">
				<Button block>
					SIGN UP
					<svg
						width="12"
						height="12"
						viewBox="0 0 16 16"
						className="transform transition-transform duration-200 ease-in-out group-hover:translate-x-1"
					>
						<path
							d="M3,10H15.173L9.587,4.413,11,3l8,8-8,8L9.587,17.587,15.173,12H3Z"
							transform="translate(-3 -3)"
							fill="currentColor"
						/>
					</svg>
				</Button>
			</div>
		</form>
	);
};
