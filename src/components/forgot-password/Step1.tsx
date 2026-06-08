import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { forgetPassStep1Schema } from "@/lib/schema";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useAppSelector } from "@/services/hooks/hooks";
import SpinnerGrow from "../spinners/SpinnerGrow";
import { Step1Props } from "@/services/types/auth/forget-password";

const Step1 = ({ handleSubmit }: Step1Props) => {
	const isLoading = useAppSelector((state) => state.sendOtp.status);
	return (
		<div>
			<Formik
				initialValues={{ email: "teacher@gmail.com" }}
				validationSchema={forgetPassStep1Schema}
				onSubmit={(values, { setSubmitting }) => {
					handleSubmit(values);
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
								placeholder="Enter your Email"
							/>

							<ErrorMessage name="email">
								{(msg) => {
									return (
										<div className="flex justify-start items-center gap-2 mt-2 pl-4.5">
											<Image
												src="/icons/exclamationMark.png"
												alt="Error Icon"
												className="h-6 w-6"
											/>
											<p className="text-[#F13030] font-normal text-sm">
												{msg}
											</p>
										</div>
									);
								}}
							</ErrorMessage>
						</div>
						<div className="mt-8">
							<Button className="mt-8" block disabled={isSubmitting}>
								{isLoading === "loading" ? (
									<div className="flex justify-center items-center gap-1">
										<SpinnerGrow />
										Loading...
									</div>
								) : (
									"Request OTP"
								)}
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
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default Step1;
