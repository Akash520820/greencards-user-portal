import api, { unwrap } from "./client";

export const getSiteContent = () => unwrap(api.get("/site-content"));

// FAQs, deliveryInformation, returnRefundPolicy, paymentMethods — any subset
export const updateSiteContent = (payload) => unwrap(api.patch("/site-content", payload));