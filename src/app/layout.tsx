import type { Metadata } from "next";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";
import StoreProvider from "./StoreProvider";

import "@/assets/styles/globals.scss";
import "@/assets/styles/backgrounds.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
	title: "e-Clinical Cases Solutions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body>
					<main className="bg-grey-bg">
						<StoreProvider>{children}</StoreProvider>
						<ToastContainer
							position="top-right"
							autoClose={5000}
							hideProgressBar={false}
							newestOnTop={false}
							closeOnClick
							rtl={false}
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme="light"
							limit={1}
						/>
					</main>
				</body>
			</html>
		</ClerkProvider>
	);
}
