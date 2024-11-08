export interface SignupValues {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface SignupCompProps {
	handleSignUp: (val: SignupValues) => void;
}
