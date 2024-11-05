"use client";

import React, { useEffect, useCallback } from "react";
import LoginComp from "@/presentation/auth/login";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { LoginFormValues } from "@/services/types/auth/login";
import { saltAndHashPassword } from "@/utils/password";

const Login = () => {
	const { data: session, status } = useSession(); // Get session and status from NextAuth
	const navigate = useRouter();

	const handleSubmitLoginUser = useCallback(async (val: LoginFormValues) => {
		const hashedPassword = saltAndHashPassword(val.password);

		// Use NextAuth signIn method with custom credentials
		const result = await signIn("credentials", {
			redirect: false, // prevent NextAuth from handling redirects
			email: val.email,
			password: hashedPassword,
		});

		if (result?.error) {
			console.error("Sign-in error:", result.error);
			// Display error to user if needed, e.g., set a state variable for error
		}
	}, []);

	useEffect(() => {
		if (status === "authenticated" && session?.user) {
			// Use the user's role to handle navigation
			if (session.user.user_role === "teacher") {
				navigate.push("/doctor/dashboard");
			} else if (session.user.user_role === "student") {
				navigate.push("/student/dashboard");
			}
		}
	}, [status, session, navigate]);

	return <LoginComp handleSubmit={handleSubmitLoginUser} />;
};

export default Login;
