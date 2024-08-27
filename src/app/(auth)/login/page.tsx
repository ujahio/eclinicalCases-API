"use client";

import React, { useEffect } from "react";
import LoginComp from "@/presentation/auth/login";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/services/hooks/hooks";
import { loginUser, resetStatus } from "@/store/slices/auth/loginSlice";
import { saltAndHashPassword } from "@/utils/password";
import { LoginFormValues } from "@/services/types/auth/login";

const Login = () => {
  const navigate = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.login.status);
  const userInfo = useAppSelector((state) => state.login.user);
  const handleSubmitLoginUser = React.useCallback(
    (val: LoginFormValues) => {
      const hashedPassword = saltAndHashPassword(val.password);
      dispatch(loginUser({ ...val, password: hashedPassword }));
    },
    [dispatch]
  );

  // useEffect(() => {
  //   const pp = saltAndHashPassword("teacher");
  //   console.log("pp::: ", pp);
  // }, []);

  useEffect(() => {
    if (isLoading === "succeeded") {
      if (userInfo.user?.roles === "teacher") {
        navigate.push("/doctor/dashboard");
      }
      if (userInfo.user?.roles[0] === "user") {
        navigate.push("/student/dashboard");
      }
      dispatch(resetStatus());
    }
  }, [isLoading]);

  return <LoginComp handleSubmit={handleSubmitLoginUser} />;
};

export default Login;
