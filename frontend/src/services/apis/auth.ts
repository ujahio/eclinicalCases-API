import { saltAndHashPassword } from "@/utils/password";
import { authApi } from "../config/axiosConfig";

export const signup = (formData: any) => authApi.post("/signup/", formData);

export const login = (formData: any) => {
  // const password = saltAndHashPassword(formData.password);
  const password = formData.password;

  return authApi.post("/signin/", { email: formData.email, password });
};

export const resetPasswordApi = (passwordData: any) => {
  return authApi.post(`/reset-password`, passwordData);
};

export const sendOtpApi = (otpData: any) => {
  return authApi.post(`/send-otp`, otpData);
};
