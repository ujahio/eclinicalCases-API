import React, { FunctionComponent, ReactNode } from "react";
import DashboardLayout from ".";
import UserImg from "@/assets/images/admin.png";

interface AdminLayoutProps {
  extraNav?: ReactNode;
  children?: any;
}

const AdminLayout: FunctionComponent<AdminLayoutProps> = ({ children, extraNav }) => {
  return (
    <DashboardLayout extraNav={extraNav} navLinks={navLinks} img={UserImg} name="George Smith">
      {children}
    </DashboardLayout>
  );
};

const navLinks = [
  {
    path: "/doctor/dashboard",
    label: "dashboard",
  },
  {
    path: "/doctor/cases",
    label: "Case Studies",
  },
];

export default AdminLayout;
