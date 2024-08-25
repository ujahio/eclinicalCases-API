"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SignupComp from "@/presentation/auth/signup";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { resetStatus, signupUser } from "@/store/slices/auth/signupSlice";
import { resetStatus as resetStatusLogin, loginUser } from "@/store/slices/auth/loginSlice";

const Signup = () => {
  const navigate = useRouter();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState({ email: "", password: "" });
  const isLoading = useAppSelector((state) => state.signup.status);
  const isLoadingLogin = useAppSelector((state) => state.login.status);
  const userInfo = useAppSelector((state) => state.login.user);

  const handleSubmitSignupUser = React.useCallback(
    (val: any) => {
      const { email, password } = val.personalDetails;
      setUser({ email, password });
      dispatch(signupUser(val));
    },
    [dispatch]
  );

  const handleSubmitLoginUser = React.useCallback(() => {
    dispatch(loginUser(user));
  }, [dispatch, user]);

  useEffect(() => {
    if (isLoading === "succeeded") {
      // navigate.push("/login");
      handleSubmitLoginUser();
      dispatch(resetStatus());
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoadingLogin === "succeeded") {
      if (userInfo.user?.roles === "teacher") {
        navigate.push("/doctor/dashboard");
      }
      if (userInfo.user?.roles[0] === "user") {
        navigate.push("/student/dashboard");
      }
      dispatch(resetStatusLogin());
    }
  }, [isLoadingLogin]);

  return <SignupComp handleSignUp={handleSubmitSignupUser} />;
};

export default Signup;
