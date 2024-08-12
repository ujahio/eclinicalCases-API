"use client";
import React from "react";
import DoctorDashboard from "@/presentation/doctor/Dashboard";
import useAllCases from "@/services/hooks/useAllCases";
import useOngoingCases from "@/services/hooks/useOngoingCases";

const Page = () => {
  useOngoingCases();
  useAllCases("recent");

  return <DoctorDashboard />;
};

export default Page;
