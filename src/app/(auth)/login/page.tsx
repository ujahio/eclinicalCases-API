"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LoginFormValues } from "@/services/types/auth/login";
import { saltAndHashPassword } from "@/utils/password";
import AuthLayout from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema } from "@/lib/schema";

const Login = () => {
	const { data: session, status } = useSession();
	const navigate = useRouter();

	const handleSubmitLoginUser = useCallback(async (val: LoginFormValues) => {
		const hashedPassword = saltAndHashPassword(val.password);

		const result = await signIn("credentials", {
			redirect: false,
			email: val.email,
			password: hashedPassword,
		});

		if (result?.error) {
			toast.error("Error signing in. Please try again.");
		}
	}, []);

	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			// Use the user's role to handle navigation
			if (session.user.user_role === "teacher") {
				navigate.push("/teacher/dashboard");
			} else if (session.user.user_role === "student") {
				navigate.push("/student/dashboard");
			}
		}
	}, [status, session?.user, navigate]);

	return (
		<AuthLayout title="Sign in to Your Account">
			<Formik
				initialValues={{ email: "", password: "" }}
				validationSchema={loginSchema}
				onSubmit={(values, { setSubmitting }) => {
					handleSubmitLoginUser(values);
					setSubmitting(false);
				}}
				validateOnChange
				validateOnBlur
			>
				{({ isSubmitting }) => (
					<Form>
						<div className="mb-3">
							<label className="mb-2 lg:mb-0.625 text-grey-300 text-1sm capitalize font-normal inline-block mt-1.5">
								Email
							</label>
							<Field
								type="text"
								className="rounded-md h-full w-full border border-grey-border outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder-grey-200 text-1sm text-dark focus:placeholder-opacity-70 transition-all duration-100 px-3-75 sm:px-4 py-5"
								id="email"
								name="email"
								placeholder="example@example.com"
							/>

							<ErrorMessage name="email">
								{(msg) => {
									return (
										<div className="flex justify-start items-center gap-2 mt-2 pl-4.5">
											<Image
												src="/icons/exclamationMark.png"
												alt="Error Icon"
												className="h-6 w-6"
												width={144}
												height={144}
											/>
											<p className="text-[#F13030] font-normal text-sm">
												{msg}
											</p>
										</div>
									);
								}}
							</ErrorMessage>
						</div>
						<div className="mb-3">
							<label className="mb-2 lg:mb-0.625 text-grey-300 text-1sm capitalize font-normal inline-block mt-1.5">
								Password
							</label>
							<Field
								type="password"
								className="rounded-md h-full w-full border border-grey-border outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 placeholder-grey-200 text-1sm text-dark focus:placeholder-opacity-70 transition-all duration-100 px-3-75 sm:px-4 py-5"
								id="password"
								name="password"
								placeholder="***********"
							/>

							<ErrorMessage name="password">
								{(msg) => {
									return (
										<div className="flex justify-start items-center gap-2 mt-2 pl-[18px]">
											<Image
												src="/icons/exclamationMark.png"
												alt="Error Icon"
												className="h-6 w-6"
												width={144}
												height={144}
											/>
											<p className="text-[#F13030] font-normal text-sm">
												{msg}
											</p>
										</div>
									);
								}}
							</ErrorMessage>
						</div>
						{/* <Link
							href="/forgot-password"
							className="text-dark text-xs uppercase font-medium mt-2 inline-block border-b border-dark hover:text-primary-300 hover:border-primary-300 transition-colors duration-100"
						>
							Forgot your password ?
						</Link> */}

						<div className="mt-8">
							<Button block disabled={isSubmitting} variant="basic" size="lg">
								{"SIGN IN"}
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
							{/* <div className="mt-1.5">
								<CheckBox onChange={() => {}} isChecked={false} name="remember">
									<span className="text-sm text-grey-300 font-medium inline-block ml-1.25">
										Keep me logged in
									</span>
								</CheckBox>
							</div> */}
							<hr className="border-grey-border h-px bg-none my-6.25" />
							<div className="inline-flex items-center text-dark">
								New User?
								<Link
									href="/signup"
									className="ml-1 text-dark text-xs font-medium inline-block border-b border-dark hover:text-primary-300 hover:border-primary-300 transition-colors duration-100"
								>
									Create Account
								</Link>
							</div>
						</div>
					</Form>
				)}
			</Formik>
		</AuthLayout>
	);
};

export default Login;
