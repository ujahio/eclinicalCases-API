import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
  password: Yup.string().required("Password Required"),
});

export const signUpSchema = Yup.object({
  username: Yup.string().required("Username Required"),
  password: Yup.string().required("Password Required").min(8, "Password must be at least 8 characters"),
  email: Yup.string().email("Invalid email address").required("Email Required"),
  number: Yup.string().required("Number Required"),
});

export const forgetPassStep1Schema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
});

export const forgetPassStep2Schema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email Required"),
  otp: Yup.number()
    .typeError("OTP must be a number")
    .required("OTP Required")
    .test("len", "OTP must be exactly 6 digits", (val: any) => val && val.toString().length === 6),
  newPassword: Yup.string().required("Password Required").min(8, "Password must be at least 8 characters"),
});
