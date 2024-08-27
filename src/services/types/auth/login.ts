export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginCompProps {
  handleSubmit: (val: LoginFormValues) => void;
}
