// Mirrors ecommerce-backend/src/constants/permissions.js — keep these two
// lists in sync. Duplicated rather than shared because the frontend and
// backend are separate deployable packages here; if this project grows a
// shared-types package later, this is a good candidate to move there.
export const ALL_PERMISSIONS = [
  "MANAGE_SELLERS",
  "MANAGE_USERS",
  "MANAGE_INVENTORY",
  "VIEW_FINANCIALS",
  "MANAGE_STAFF",
  "MODERATE_REVIEWS",
  "MANAGE_SITE_CONTENT",
  "MANAGE_ORDERS",
  "MANAGE_RETURNS",
  "MANAGE_COUPONS",
  "VIEW_CONTACT_MESSAGES",
];
