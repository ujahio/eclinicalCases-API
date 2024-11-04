import type { Metadata } from "next";
import "@/assets/styles/globals.scss";
import "@/assets/styles/backgrounds.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StoreProvider from "./StoreProvider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
	title: "e-Clinical Cases Solutions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<main className="bg-grey-bg">
					<SessionProvider>
						<StoreProvider>{children}</StoreProvider>
					</SessionProvider>{" "}
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
	);
}
