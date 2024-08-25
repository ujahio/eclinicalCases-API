import React, { FunctionComponent, ReactNode } from "react";
import Nav from "./nav";
import { APP_CONTAINER, APP_SPACING } from "@/services/constants/styles";

interface DashboardLayoutProps {
  extraNav?: ReactNode;
  navLinks?: { path: string; label: string }[];
  img?: any;
  name?: string;
  children?: any;
}

const DashboardLayout: FunctionComponent<DashboardLayoutProps> = ({ children, extraNav, navLinks, img, name }) => {
  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <Nav navLinks={navLinks} img={img} name={name}>
        {extraNav}
      </Nav>
      <main className={`w-full flex-1 py-8 sm:py-10 mb-10 h-full ${APP_SPACING} ${APP_CONTAINER}`}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
