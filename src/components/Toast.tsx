import { toast } from "react-hot-toast";
import PropTypes from "prop-types";

interface ToastProps {
  success: string;
  message: string;
  duration?: number;
}

export default function Toast({ success, message, duration = 5000 }: ToastProps) {
  if (success === "success") {
    return toast.success(message, { duration });
  } else {
    return toast.error(message, { duration });
  }
}

Toast.propTypes = {
  success: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
};
