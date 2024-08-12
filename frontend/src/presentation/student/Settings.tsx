import React from "react";
import DashboardLayout from "../../components/layouts/dashboard";
import UserImage from "../../assets/images/user.png";
import useProcessTabs from "@/services/hooks/useProcessTabs";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { PasswordSettings, PersonalDetailsSettings } from "@/components/account-settings";
import Tabs from "@/components/ui/Tabs";

const tabs = ["Personal Details", "Password", "Payment"];
const AccountSettings = () => {
  const { isActive, active, switchTab } = useProcessTabs(tabs, 0);

  return (
    <DashboardLayout>
      <div className="flex items-center">
        <figure className="h-15 sm:h-20 md:h-25 w-15 sm:w-20 md:w-25 rounded-full overflow-hidden">
          <Image src={UserImage} alt="Profile image" className="h-full w-full" />
        </figure>
        <Button btnStyle="outline" size="sm" className="ml-3.75">
          Change Picture
        </Button>
      </div>

      <div className="mt-10 sm:mt-12.5">
        <div className="border-b border-grey-400 border-opacity-40 h-11.25 sm:h-12.5 relative">
          <Tabs tabs={tabs} changeTab={switchTab} active={active} />
        </div>

        <div className="items-center mt-10 sm:mt-12.5">
          <div className="mx-auto w-11/12 max-w-xl bg-white py-10 px-6 sm:p-8.75 md:p-10 border border-grey-border rounded-sm">
            {isActive("personal_details") && <PersonalDetailsSettings />}
            {isActive("password") && <PasswordSettings />}
            {isActive("payment") && <p>Nothing to see here yet</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
