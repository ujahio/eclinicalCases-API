import type { Metadata } from "next";
import "./global.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StoreProvider from "./StoreProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Nunito_Sans, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const nunitoFont = Nunito_Sans({
	fallback: ["nunito", "Roboto", "Gideon Roman", "sans-serif"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "e-Clinical Cases Solutions",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn(nunitoFont.className, "font-sans", geist.variable)}
		>
			<body>
				<main className="bg-grey-bg">
					<TooltipProvider>
						<StoreProvider>{children}</StoreProvider>
					</TooltipProvider>
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
