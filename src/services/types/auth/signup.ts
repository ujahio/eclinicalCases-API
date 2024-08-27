export interface SignupValues {
  personalDetails: {
    email: string;
    password: string;
  };
}

export interface SignupCompProps {
  handleSignUp: (val: SignupValues) => void;
}
