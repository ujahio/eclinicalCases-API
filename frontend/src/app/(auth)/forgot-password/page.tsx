"use client";

import React, { useEffect, useState } from "react";
import ForgotPasswordComp from "@/presentation/auth/forgotPassword";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { resetSendOtpStatus, sendOtp } from "@/store/slices/auth/sendOtpSlice";
import { resetPassword, resetResetPasswordStatus } from "@/store/slices/auth/resetPasswordSlice";
import { useRouter } from "next/navigation";
const ForgotPassword = () => {
  const navigate = useRouter();
  const [steps, setSteps] = useState(1);
  const otpState = useAppSelector((state) => state.sendOtp);
  const passwordState = useAppSelector((state) => state.resetPassword);
  const dispatch = useAppDispatch();

  const handleSendOtp = (otpData: any) => {
    dispatch(sendOtp(otpData));
  };

  const handleResetPassword = (passwordData: any) => {
    dispatch(resetPassword(passwordData));
  };

  useEffect(() => {
    if (otpState.status === "succeeded") {
      dispatch(resetSendOtpStatus());
      setSteps(2);
    }
  }, [otpState.status, dispatch]);

  useEffect(() => {
    if (passwordState.status === "succeeded") {
      dispatch(resetResetPasswordStatus());
      navigate.push("/login");
    }
  }, [passwordState.status, dispatch]);

  return (
    <div>
      <ForgotPasswordComp steps={steps} handleSendOtp={handleSendOtp} handleResetPassword={handleResetPassword} />
    </div>
  );
};

export default ForgotPassword;
