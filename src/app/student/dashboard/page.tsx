"use client";

import React from "react";
import StudentDashboardComp from "@/presentation/student/Dashboard";
import useAllCases from "@/services/hooks/useAllCases";
import useOngoingCases from "@/services/hooks/useOngoingCases";
const StudentDashboard = () => {
  useOngoingCases();
  useAllCases("recent");
  return <StudentDashboardComp />;
};

export default StudentDashboard;
