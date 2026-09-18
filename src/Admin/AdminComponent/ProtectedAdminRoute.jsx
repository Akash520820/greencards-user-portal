import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

// Gates the /admin/* panel to staff accounts (role "admin" or "superadmin").
// Real sellers (role "seller") are a completely separate panel — see
// Seller/SellerComponent/ProtectedSellerRoute.jsx.
//
// checkAdminAuth() is triggered HERE rather than unconditionally in
// AdminAuthProvider, so GET /staff/current-staff only ever fires for
// visitors who actually land on an /admin/* route — whether via a full
// page reload or client-side navigation from elsewhere in the app —
// instead of on every single page load regardless of route.
const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, admin, loading, checkAdminAuth } = useAdminAuth();

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading…
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  if (admin?.role !== "admin" && admin?.role !== "superadmin") {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;