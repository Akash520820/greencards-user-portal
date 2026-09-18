import api, { unwrap } from "./client";

export const createReturn = (payload) => unwrap(api.post("/returns", payload));

export const getMyReturns = () => unwrap(api.get("/returns"));

export const getReturnById = (returnId) => unwrap(api.get(`/returns/${returnId}`));

// admin only
export const getAllReturns = () => unwrap(api.get("/returns/admin/all"));

export const reviewReturn = (returnId, payload) =>
  unwrap(api.patch(`/returns/admin/${returnId}/review`, payload));

export const markPickedUp = (returnId) => unwrap(api.patch(`/returns/admin/${returnId}/pickup`));

export const processRefund = (returnId) => unwrap(api.patch(`/returns/admin/${returnId}/refund`));
