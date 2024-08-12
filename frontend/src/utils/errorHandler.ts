import { toast } from "react-toastify";

export const handleApiError = (error: any): Promise<never> => {
  const defaultErrorMessage = "An unexpected error occurred";
  let errorMessage = defaultErrorMessage;
  if (error.response && error.response.data) {
    errorMessage = error.response.data?.error;
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
