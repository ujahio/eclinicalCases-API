import React, { FunctionComponent, FormEvent, useState, ChangeEvent } from "react";
import PropTypes from "prop-types";
import Button from "@/components/ui/Button";
import { InputField, PasswordField } from "@/components/form-elements";
import Toast from "@/components/Toast";
import { saltAndHashPassword } from "@/utils/password";

export interface PersonalDetailsProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
}

type SignUpFormProps = {
  switchByKey: (key: string) => void;
  caputurePersonalDetails: (personalDetails: PersonalDetailsProps) => void;
};

const SignUpForm: FunctionComponent<SignUpFormProps> = ({ switchByKey, caputurePersonalDetails }) => {
  const [personalDetails, setPersonalDetails] = useState<PersonalDetailsProps>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
  });
  const submitForm = (e: FormEvent) => {
    e.preventDefault();

    if (personalDetails.password === personalDetails.confirmPassword) {
      const hashedPassword = saltAndHashPassword(personalDetails.password);
      const updatedDetails = { ...personalDetails, password: hashedPassword };
      caputurePersonalDetails(updatedDetails);
      switchByKey("professional_details");
    } else {
      Toast({ success: "error", message: "Passwords do not match" });
    }
  };

  const captureFirstName = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPersonalDetails({ ...personalDetails, firstName: e.currentTarget.value });
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
    setPersonalDetails({ ...personalDetails, confirmPassword: e.currentTarget.value });
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
          Continue
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

SignUpForm.propTypes = {
  switchByKey: PropTypes.func.isRequired,
  caputurePersonalDetails: PropTypes.func.isRequired,
};

export { SignUpForm };
