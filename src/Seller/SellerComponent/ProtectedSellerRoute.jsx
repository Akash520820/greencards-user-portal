import { Navigate } from "react-router-dom";
import { useSellerAuth } from "../../context/SellerAuthContext";

// Gates the /seller/* panel to genuinely approved sellers (role === "seller").
// Staff accounts (admin/superadmin) have their own, separate panel at
// /admin/* — see Admin/AdminComponent/ProtectedAdminRoute.jsx.
const ProtectedSellerRoute = ({ children }) => {
  const { isSellerAuthenticated, seller, loading } = useSellerAuth();

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

  if (!isSellerAuthenticated || seller?.role !== "seller") {
    return <Navigate to="/seller/auth" replace />;
  }

  return children;
};

export default ProtectedSellerRoute;
