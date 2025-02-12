import { signOut } from "next-auth/react";
import { toast } from "react-toastify";

export const handleApiError = (error: any): Promise<never> => {
	const defaultErrorMessage = "An unexpected error occurred";
	let errorMessage = defaultErrorMessage;
	if (error.response && error.response.data) {
		errorMessage = error.response.data?.message || errorMessage;
	}
	if (error.response && error.response.status === 401) {
		errorMessage = error.response.data?.message || errorMessage;
		signOut({ callbackUrl: "/login" });
	}

	toast.error(errorMessage, {
		position: "top-right",
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		progress: undefined,
		theme: "light",
	});

	return Promise.reject(error);
};
