import api, { unwrap } from "./client";

export const getProductReviews = (productId) => unwrap(api.get(`/reviews/product/${productId}`));

export const createReview = (payload) => unwrap(api.post("/reviews", payload));

export const updateReview = (reviewId, payload) => unwrap(api.patch(`/reviews/${reviewId}`, payload));

export const deleteReview = (reviewId) => unwrap(api.delete(`/reviews/${reviewId}`));
