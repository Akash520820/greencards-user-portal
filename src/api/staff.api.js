import api, { unwrap } from "./client";

// ---- Auth ----
// Two-step when MFA is enabled: loginStaff() returns { mfaRequired: true, staffId }
// instead of a session — call verifyMfaLogin(staffId, code) next.
export const loginStaff = (companyEmail, password) =>
  unwrap(api.post("/staff/login", { companyEmail, password }));

export const verifyMfaLogin = (staffId, code) =>
  unwrap(api.post("/staff/mfa/login", { staffId, code }));

export const logoutStaff = () => unwrap(api.post("/staff/logout"));

export const getCurrentStaff = () => unwrap(api.get("/staff/current-staff"));

export const changeStaffPassword = (oldPassword, newPassword) =>
  unwrap(api.post("/staff/change-password", { oldPassword, newPassword }));

// ---- MFA enrollment ----
// setupMfa() returns { qrCodeDataUrl, secret } — show the QR code, then
// call verifyMfaSetup(code) with a code from the authenticator app to
// actually turn MFA on.
export const setupMfa = () => unwrap(api.post("/staff/mfa/setup"));

export const verifyMfaSetup = (code) => unwrap(api.post("/staff/mfa/verify-setup", { code }));

export const disableMfa = () => unwrap(api.post("/staff/mfa/disable"));

// ---- Staff management (superadmin only) ----
export const getAllStaff = () => unwrap(api.get("/staff"));

export const updateStaffPermissions = (staffId, permissions) =>
  unwrap(api.patch(`/staff/${staffId}/permissions`, { permissions }));

export const toggleStaffActive = (staffId) => unwrap(api.patch(`/staff/${staffId}/toggle-active`));

// ---- Access requests (provisioning workflow, Phase 4) ----
// type: "create_staff" — { type, targetEmail, targetFullName, requestedRole, requestedPermissions, reason }
// type: "extend_elevation" — { type, targetStaffId, requestedRole, durationHours, reason }
export const createAccessRequest = (payload) => unwrap(api.post("/staff/access-requests", payload));

// status: "pending" | "approved" | "rejected" | "all" (default "pending")
export const getAccessRequests = (status) =>
  unwrap(api.get("/staff/access-requests", { params: status ? { status } : {} }));

export const reviewAccessRequest = (requestId, decision, comment) =>
  unwrap(api.patch(`/staff/access-requests/${requestId}/review`, { decision, comment }));

// ---- Audit log (superadmin only, read-only) ----
export const getAuditLogs = (params = {}) => unwrap(api.get("/staff/audit-logs", { params }));
