import Image from "next/image";
import {
	PasswordSettings,
	PersonalDetailsSettings,
} from "@/components/account-settings";
import AdminLayout from "@/components/layouts/dashboard/admin";
import { Button } from "@/components/ui/button";
import Tabs from "@/components/ui/Tabs";
import useProcessTabs from "@/services/hooks/useProcessTabs";

const tabs = ["Personal Details", "Password"];

const AdminAccountSettings = () => {
	const { isActive, active, switchTab } = useProcessTabs(tabs, 0);
	return (
		<AdminLayout>
			<div className="flex items-center">
				<figure className="h-15 sm:h-20 md:h-25 w-15 sm:w-20 md:w-25 rounded-full overflow-hidden">
					<Image
						src="/images/admin.png"
						alt="Profile image"
						className="h-full w-full"
						width={260}
						height={260}
					/>
				</figure>
				<Button variant="outline" size="sm" className="ml-3-75">
					Change Picture
				</Button>
			</div>

			<div className="mt-10 sm:mt-12.5">
				<div className="border-b border-grey-400 border-opacity-40 h-11.25 sm:h-12.5 relative">
					<Tabs tabs={tabs} changeTab={switchTab} active={active} />
				</div>

				<div className="items-center mt-10 sm:mt-12.5">
					<div className="mx-auto w-11/12 max-w-xl bg-white py-10 px-6 sm:p-8.75 md:p-10 border border-grey-border rounded-sm">
						{isActive("personal_details") && (
							<PersonalDetailsSettings isAdmin={isAdmin} />
						)}
						{isActive("password") && <PasswordSettings />}
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

const isAdmin = true;

export default AdminAccountSettings;
