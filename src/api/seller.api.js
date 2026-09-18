import api, { unwrap } from "./client";

// ---- Any logged-in user (role stays "user" until an admin approves) ----

// formData is a FormData: businessName, gstNumber, storeDescription,
// accountHolderName, accountNumber, ifscCode, bankName, bankBranch,
// accountType ("savings" | "current" | "business"), upiId, storeLogo (file)
export const applyForSeller = (formData) =>
  unwrap(
    api.post("/seller/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// Returns the caller's own SellerProfile (status: pending | approved | rejected | suspended).
// Throws a 404-backed error if the user has never applied.
export const getMySellerProfile = () => unwrap(api.get("/seller/me"));

// ---- Approved sellers only (role === "seller") ----

// { totalProducts, totalRevenue, totalUnitsSold } — scoped to this seller's own products/orders
export const getSellerAnalytics = () => unwrap(api.get("/seller/analytics"));

// { page, limit } — returns { products, pagination } — only products this seller created
export const getMyProducts = (params = {}) => unwrap(api.get("/seller/products", { params }));

// { page, limit } — returns { orders, pagination } — each order trimmed to just this
// seller's own line items, even when the order also contains other sellers' products
export const getSellerOrders = (params = {}) => unwrap(api.get("/seller/orders", { params }));

// { page, limit } — returns { reviews, pagination } — reviews on this seller's products
export const getMyProductReviews = (params = {}) => unwrap(api.get("/seller/reviews", { params }));

export const respondToReview = (reviewId, comment) =>
  unwrap(api.post(`/seller/reviews/${reviewId}/respond`, { comment }));

export const updateSellerOrderItemStatus = (orderId, itemStatus) =>
  unwrap(api.patch(`/seller/orders/${orderId}/status`, { itemStatus }));

export const deleteReviewResponse = (reviewId, responseId) =>
  unwrap(api.delete(`/seller/reviews/${reviewId}/respond/${responseId}`));



