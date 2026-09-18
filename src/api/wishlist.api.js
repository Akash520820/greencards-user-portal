import api, { unwrap } from "./client";

export const getWishlist = () => unwrap(api.get("/wishlist"));

export const addToWishlist = (productId) => unwrap(api.post("/wishlist", { productId }));

export const removeFromWishlist = (productId) => unwrap(api.delete(`/wishlist/${productId}`));
