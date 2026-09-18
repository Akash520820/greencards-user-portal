import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

// Use this INSIDE the already admin-gated /admin routes (ProtectedAdminRoute
// already confirmed the user is at least an admin) to further restrict a
// page to superadmin only — e.g. the Super Admin dashboard.
const ProtectedSuperAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading…
      </div>
    );
  }

  if (admin?.role !== "superadmin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedSuperAdminRoute;
