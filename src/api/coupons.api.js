import api, { unwrap } from "./client";

export const validateCoupon = (payload) => unwrap(api.post("/coupons/validate", payload));
export const createCoupon = (payload) => unwrap(api.post("/coupons", payload));
export const getAllCoupons = () => unwrap(api.get("/coupons"));
export const deleteCoupon = (couponId) => unwrap(api.delete(`/coupons/${couponId}`));
