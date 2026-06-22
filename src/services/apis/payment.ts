import { studentApi, configureRequestHeaders } from "../config/fetchClient";

export const createPaymentCheckout = async () => {
  return studentApi.post("/payment/checkout", {}, configureRequestHeaders());
};

export const checkSubscriptionStatus = async () => {
  return studentApi.get("/payment/status", configureRequestHeaders());
};
