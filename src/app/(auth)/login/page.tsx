"use client";

import React, { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoginComp from "@/presentation/auth/login";

import { LoginFormValues } from "@/services/types/auth/login";
import { saltAndHashPassword } from "@/utils/password";

const Login = () => {
	// const session = await authClient.getSession();
	// console.log("session in progress", session);
	// const navigate = useRouter();

	const handleSubmitLoginUser = useCallback(async (val: LoginFormValues) => {
		try {
			const hashedPassword = saltAndHashPassword(val.password);

			const { data, error } = await authClient.signIn.email({
				email: val.email,
				password: hashedPassword,
				callbackURL: "/",
			});

			console.log("Login response:", { data, error });
		} catch (error) {
			toast.error("Error signing in. Please try again.");
		}
	}, []);

	// useEffect(() => {
	// 	// if (status === "authenticated" && session?.user) {
	// 	if (session?.data?.user) {
	// 		// Use the user's role to handle navigation
	// 		if (session.data?.user.user_role === "teacher") {
	// 			navigate.push("/teacher/dashboard");
	// 		} else if (session.data?.user.user_role === "student") {
	// 			navigate.push("/student/dashboard");
	// 		}
	// 	}
	// }, [session, navigate]);

	return <LoginComp handleSubmit={handleSubmitLoginUser} />;
};

export default Login;
