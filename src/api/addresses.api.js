import api, { unwrap } from "./client";

export const getAddresses = () => unwrap(api.get("/addresses"));

export const addAddress = (payload) => unwrap(api.post("/addresses", payload));

export const updateAddress = (addressId, payload) =>
  unwrap(api.patch(`/addresses/${addressId}`, payload));

export const deleteAddress = (addressId) => unwrap(api.delete(`/addresses/${addressId}`));

export const setDefaultAddress = (addressId) =>
  unwrap(api.patch(`/addresses/${addressId}/set-default`));
