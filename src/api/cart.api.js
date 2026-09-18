import api, { unwrap } from "./client";

export const getCart = () => unwrap(api.get("/cart"));

// variant: { color, size } — optional, only for products with colorVariants
export const addToCart = (productId, quantity = 1, variant) =>
  unwrap(api.post("/cart", { productId, quantity, variant }));

export const updateCartItem = (itemId, quantity) =>
  unwrap(api.patch(`/cart/${itemId}`, { quantity }));

export const removeFromCart = (itemId) => unwrap(api.delete(`/cart/${itemId}`));

export const clearCart = () => unwrap(api.delete("/cart"));
