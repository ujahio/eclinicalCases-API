import { FC, ReactNode } from "react";
import DashboardLayout from ".";

interface AdminLayoutProps {
	extraNav?: ReactNode;
	children?: any;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children, extraNav }) => {
	return (
		<DashboardLayout
			extraNav={extraNav}
			navLinks={navLinks}
			img="/images/admin.png"
			name="George Smith"
		>
			{children}
		</DashboardLayout>
	);
};

const navLinks = [
	{
		path: "/teacher/dashboard",
		label: "dashboard",
	},
	{
		path: "/teacher/cases",
		label: "Case Studies",
	},
];

export default AdminLayout;
