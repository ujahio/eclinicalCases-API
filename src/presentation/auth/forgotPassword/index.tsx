import Step1 from "@/components/forgot-password/Step1";
import Step2 from "@/components/forgot-password/Step2";
import AuthLayout from "@/components/layouts/AuthLayout";
import { ForgetPasswordProps } from "@/services/types/auth/forget-password";

import React, { FC } from "react";

const ForgotPassword = ({ steps, handleSendOtp, handleResetPassword }: ForgetPasswordProps) => {
  return (
    <AuthLayout title="Forgot Password">
      {steps === 1 ? <Step1 handleSubmit={handleSendOtp} /> : <Step2 handleSubmit={handleResetPassword} />}
    </AuthLayout>
  );
};

export default ForgotPassword;
