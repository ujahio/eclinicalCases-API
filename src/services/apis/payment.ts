import { studentApi, configureRequestHeaders } from "../config/fetchClient";

export const createPaymentCheckout = async (paymentType: string) => {
	return studentApi.post(
		"/payment/checkout",
		{ paymentType },
		configureRequestHeaders(),
	);
};

export const checkPaymentStatus = async () => {
	return studentApi.get("/payment/status", configureRequestHeaders());
};
