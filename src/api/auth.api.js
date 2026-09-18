import api, { unwrap } from "./client";

// STEP 1 — sends an OTP to the email, doesn't create the account yet.
// Backend requires: userName, email, fullName, password, phone (10-digit), avatar (file)
export const registerUser = (formData) =>
  unwrap(
    api.post("/users/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// STEP 2 — verifying the OTP is what actually creates the account.
export const verifyRegistrationOtp = (email, otp) =>
  unwrap(api.post("/users/verify-otp", { email, otp }));

export const resendRegistrationOtp = (email) =>
  unwrap(api.post("/users/resend-otp", { email }));

// email OR userName, plus password
export const loginUser = ({ email, userName, password }) =>
  unwrap(api.post("/users/login", { email, userName, password }));

export const logoutUser = () => unwrap(api.post("/users/logout"));

export const getCurrentUser = () => unwrap(api.get("/users/current-user"));

export const forgotPassword = (email) =>
  unwrap(api.post("/users/forgot-password", { email }));

export const resetPassword = (email, otp, newPassword) =>
  unwrap(api.post("/users/reset-password", { email, otp, newPassword }));
