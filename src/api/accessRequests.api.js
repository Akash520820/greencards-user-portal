import api, { unwrap } from "./client";

/**
 * Become Seller — Access Request API
 *
 * Flow:
 *   User Portal "Become a Seller" page
 *     → applyForSellerAccess(formData)
 *       → POST /api/v1/access-requests
 *         → API Gateway → User Backend (greencard-user cluster)
 *
 *   Admin Portal "Seller Applications" page
 *     → getPendingAccessRequests()
 *       → GET /api/v1/access-requests?status=pending
 *         → API Gateway → User Backend
 *
 *     → approveAccessRequest(id) / rejectAccessRequest(id, reason)
 *       → PATCH /api/v1/access-requests/:id
 *         → API Gateway → User Backend
 */

// ---- User Portal: submit seller application ----
export const applyForSellerAccess = (formData) =>
  unwrap(
    api.post("/access-requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

// Check the current user's own application status
export const getMyAccessRequest = () => unwrap(api.get("/access-requests/me"));

// ---- Admin Portal: manage incoming seller applications ----

// status: "pending" | "approved" | "rejected" | "all"
export const getAccessRequests = (status = "pending") =>
  unwrap(api.get("/access-requests", { params: { status } }));

export const approveAccessRequest = (requestId) =>
  unwrap(api.patch(`/access-requests/${requestId}/approve`));

export const rejectAccessRequest = (requestId, reason) =>
  unwrap(api.patch(`/access-requests/${requestId}/reject`, { reason }));
