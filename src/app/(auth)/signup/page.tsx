"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupComp from "@/presentation/auth/signup";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { resetStatus, signupUser } from "@/store/slices/auth/signupSlice";
import { SignupValues } from "@/services/types/auth/signup";
import { toast } from "react-toastify";

const Signup = () => {
	const navigate = useRouter();
	const dispatch = useAppDispatch();
	const signUpState = useAppSelector((state) => state.signup);

	const handleSubmitSignupUser = React.useCallback(
		(val: SignupValues) => {
			dispatch(signupUser({ ...val, user_role: "student" }));
		},
		[dispatch]
	);

	useEffect(() => {
		if (signUpState.status === "succeeded") {
			toast.success("User registered successfully", {
				position: "top-right",
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: "light",
			});
			navigate.push("/login");
			dispatch(resetStatus());
		}
	}, [signUpState, dispatch, navigate]);

	return <SignupComp handleSignUp={handleSubmitSignupUser} />;
};

export default Signup;
