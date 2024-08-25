import Step1 from "@/components/forgot-password/Step1";
import Step2 from "@/components/forgot-password/Step2";
import AuthLayout from "@/components/layouts/AuthLayout";

import React, { FC } from "react";

interface IProps {
  steps: number;
  handleSendOtp: (otpData: any) => void;
  handleResetPassword: (passwordData: any) => void;
}

const ForgotPassword: FC<IProps> = ({ steps, handleSendOtp, handleResetPassword }) => {
  return (
    <AuthLayout title="Forgot Password">
      {steps === 1 ? <Step1 handleSubmit={handleSendOtp} /> : <Step2 handleSubmit={handleResetPassword} />}
    </AuthLayout>
  );
};

export default ForgotPassword;
