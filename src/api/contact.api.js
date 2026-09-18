import api, { unwrap } from "./client";

// public — Contact Us form submission
export const submitContactMessage = (payload) => unwrap(api.post("/contact", payload));

// admin only — Contact Messages inbox
export const getContactMessages = (params) => unwrap(api.get("/contact", { params }));

export const markContactMessageRead = (messageId) =>
  unwrap(api.patch(`/contact/${messageId}/read`));
