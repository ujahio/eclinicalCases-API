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
	// switchByKey: (key: string) => void;
	// capturePersonalDetails: (personalDetails: PersonalDetailsProps) => void;
	handleSignUp: (val: PersonalDetailsProps) => void;
};

const passwordRequirements = [
	{
		label: "At least 8 characters",
		validator: (password: string) => password.length >= 8,
	},
	{
		label: "At least one uppercase letter",
		validator: (password: string) => /[A-Z]/.test(password),
	},
	{
		label: "At least one lowercase letter",
		validator: (password: string) => /[a-z]/.test(password),
	},
	{
		label: "At least one number",
		validator: (password: string) => /\d/.test(password),
	},
	{
		label: "At least one special character (!@#$%^&*)",
		validator: (password: string) => /[!@#$%^&*]/.test(password),
	},
];

export const SignUpForm: FunctionComponent<SignUpFormProps> = ({
	// switchByKey,
	// capturePersonalDetails,
	handleSignUp,
}) => {
	const [personalDetails, setPersonalDetails] = useState<PersonalDetailsProps>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [validationResults, setValidationResults] = useState<boolean[]>(
		new Array(passwordRequirements.length).fill(false)
	);
	const [isPasswordTyping, setIsPasswordTyping] = useState(false);

	const submitForm = (e: FormEvent) => {
		e.preventDefault();

		if (personalDetails.password === personalDetails.confirmPassword) {
			const hashedPassword = saltAndHashPassword(personalDetails.password);
			const updatedDetails = {
				...personalDetails,
				password: hashedPassword,
				confirmPassword: hashedPassword,
			};
			handleSignUp(updatedDetails);
			// capturePersonalDetails(updatedDetails);
			// switchByKey("professional_details");
		} else {
			toast.error("Passwords do not match");
		}
	};

	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		const password = e.target.value;

		if (!isPasswordTyping && password.length > 0) {
			setIsPasswordTyping(true);
		} else if (password.length === 0) {
			setIsPasswordTyping(false);
		}

		setPersonalDetails({ ...personalDetails, password });

		// Update validation results
		const results = passwordRequirements.map((requirement) =>
			requirement.validator(password)
		);
		setValidationResults(results);
	};

	const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
		const confirmPassword = e.target.value;
		setPersonalDetails({
			...personalDetails,
			confirmPassword: confirmPassword,
		});
	};

	// Check if all validations pass
	const isFormValid =
		validationResults.every((result) => result) &&
		personalDetails.password === personalDetails.confirmPassword;

	return (
		<form onSubmit={submitForm} className="mt-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
				<InputField
					label="First Name"
					name="firstName"
					placeholder="Enter first name"
					onChange={(e) =>
						setPersonalDetails({
							...personalDetails,
							firstName: e.target.value,
						})
					}
					required
				/>
				<div>
					<InputField
						label="Last Name"
						name="lastName"
						placeholder="Enter last name"
						onChange={(e) =>
							setPersonalDetails({
								...personalDetails,
								lastName: e.target.value,
							})
						}
						required
					/>
				</div>
			</div>
			<InputField
				label="Email Address"
				placeholder="Enter your email"
				name="email"
				type="email"
				onChange={(e) =>
					setPersonalDetails({ ...personalDetails, email: e.target.value })
				}
				required
			/>
			<PasswordField
				label="Password"
				placeholder="Enter your password"
				name="password"
				onChange={handlePasswordChange}
				required
			/>
			{/* Password Validation Guide */}
			{isPasswordTyping && (
				<ul className="mb-4">
					{passwordRequirements.map((requirement, index) => (
						<li
							key={index}
							className={`text-sm ${
								validationResults[index] ? "text-green-600" : "text-red-600"
							}`}
						>
							{requirement.label}
						</li>
					))}
				</ul>
			)}
			<PasswordField
				label="Confirm Password"
				placeholder="Enter your password again"
				name="confirmPassword"
				onChange={handleConfirmPasswordChange}
				required
			/>
			<div className="mt-8">
				<Button block disabled={!isFormValid}>
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
