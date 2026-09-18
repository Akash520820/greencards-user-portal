import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import * as staffApi from '../api/staff.api';

const AdminAuthContext = createContext();

// This is the login for STAFF accounts — role "admin" or "superadmin".
// Staff now live in a completely separate collection/cookie/JWT secret
// from customers and sellers (see ecommerce-backend's staff.model.js) —
// this context talks to staff.api.js, never auth.api.js. There is no
// self-service admin signup: a staff account can only come from an
// approved access request (see /admin/superadmin's Access Requests tab)
// or the one-off bootstrap script for the very first superadmin.

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  // Starts true — meaning "not yet determined" — but nothing outside
  // ProtectedAdminRoute reads this, so it never blocks rendering the rest
  // of the app (see the removed `{!loading && children}` gate below).
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  // Lazily triggered by ProtectedAdminRoute the moment someone actually
  // lands on an /admin/* route — via a full reload OR client-side
  // navigation — rather than running unconditionally on every single page
  // load regardless of route. This is what previously fired
  // GET /staff/current-staff (plus, after the refresh-retry fix, an
  // extra POST /staff/refresh-token) for every visitor on every page,
  // even customers who never go near /admin. checkedRef ensures it only
  // ever runs once per app session.
  const checkAdminAuth = useCallback(async () => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    try {
      const res = await staffApi.getCurrentStaff();
      setAdmin(res.data);
      setIsAdminAuthenticated(true);
    } catch {
      // not logged in — fine, just stay logged out
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 1: password login. If the account has MFA enabled, this does NOT
  // log the admin in — it returns { mfaRequired: true, staffId } so the
  // login page can show the "enter your code" screen and call
  // adminVerifyMfa next.
  const adminLogin = async (companyEmail, password) => {
    try {
      const res = await staffApi.loginStaff(companyEmail, password);

      if (res.data.mfaRequired) {
        return { success: true, mfaRequired: true, staffId: res.data.staffId };
      }

      setAdmin(res.data.staff);
      setIsAdminAuthenticated(true);
      return { success: true, admin: res.data.staff };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Please try again.' };
    }
  };

  // Step 2, only reached when adminLogin returned mfaRequired: true
  const adminVerifyMfa = async (staffId, code) => {
    try {
      const res = await staffApi.verifyMfaLogin(staffId, code);
      setAdmin(res.data.staff);
      setIsAdminAuthenticated(true);
      return { success: true, admin: res.data.staff };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid or expired code.' };
    }
  };

  // Self-service admin signup is intentionally unavailable — see note above.
  const adminSignup = async () => {
    return {
      success: false,
      error:
        'Self-service admin signup is not available. An existing staff member with staff-management permission must submit an access request, which a super admin then approves.',
    };
  };

  const adminLogout = async () => {
    try {
      await staffApi.logoutStaff();
    } catch {
      // clear local state regardless
    }
    setAdmin(null);
    setIsAdminAuthenticated(false);
  };

  const value = {
    isAdminAuthenticated,
    admin,
    loading,
    checkAdminAuth,
    adminLogin,
    adminVerifyMfa,
    adminSignup,
    adminLogout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;