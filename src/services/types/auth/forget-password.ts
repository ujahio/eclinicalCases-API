export interface Step1Props {
  handleSubmit: (otpData: { email: string }) => void;
}
export interface Step2Props {
  handleSubmit: (passwordData: { email: string; otp: string; newPassword: string }) => void;
}
export interface ForgetPasswordProps {
  steps: number;
  handleSendOtp: (otpData: { email: string }) => void;
  handleResetPassword: (passwordData: any) => void;
}
