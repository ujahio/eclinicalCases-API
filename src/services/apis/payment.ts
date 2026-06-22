import { studentApi, configureRequestHeaders } from "../config/fetchClient";

export const createPaymentCheckout = async (paymentType: string) => {
  return studentApi.post("/payment/checkout", { paymentType }, configureRequestHeaders());
};

export const checkSubscriptionStatus = async () => {
  return studentApi.get("/payment/status", configureRequestHeaders());
};
