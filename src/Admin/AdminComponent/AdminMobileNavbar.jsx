import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  MdDashboard, 
  MdInventory, 
  MdAddCircle, 
  MdShoppingCart, 
  MdAccountCircle,
  MdLogout,
  MdAdminPanelSettings,
  MdHowToReg,
  MdFlag,
  MdArticle
} from 'react-icons/md';
import './AdminMobileNavbar.css';

const AdminMobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getOrderStats } = useOrders();
  const { products } = useProducts();
  const { admin, adminLogout } = useAdminAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const isSuperAdmin = admin?.role === 'superadmin';
  const displayName = admin?.fullName || admin?.userName || 'Admin';
  
  const orderStats = getOrderStats();
  const pendingOrdersCount = orderStats.pendingOrders;

  const isActive = (path) => location.pathname === path;

  // 👇 Close account menu on window resize (fixes the bug)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991.98) {
        setShowAccountMenu(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 👇 Close menu on route change
  useEffect(() => {
    setShowAccountMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setShowAccountMenu(false);
    adminLogout();
    navigate('/admin/auth');
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
  };

  return (
    <>
      {/* Account Dropdown Menu */}
      {showAccountMenu && (
        <>
          <div 
            className="admin-mobile-overlay" 
            onClick={() => setShowAccountMenu(false)}
          />
          <div className="admin-mobile-account-menu">
            <div className="admin-account-header">
              <div className="admin-account-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="admin-account-info">
                <div className="admin-account-name">{displayName}</div>
                <div className="admin-account-email">{admin?.email}</div>
              </div>
            </div>
            
            <div className="admin-account-divider"></div>

            <Link
              to="/admin/seller-applications"
              className="admin-account-menu-item"
              onClick={() => setShowAccountMenu(false)}
            >
              <MdHowToReg className="admin-account-menu-icon" />
              <span>Seller Applications</span>
            </Link>

            <Link
              to="/admin/reported-reviews"
              className="admin-account-menu-item"
              onClick={() => setShowAccountMenu(false)}
            >
              <MdFlag className="admin-account-menu-icon" />
              <span>Reported Reviews</span>
            </Link>

            <Link
              to="/admin/site-content"
              className="admin-account-menu-item"
              onClick={() => setShowAccountMenu(false)}
            >
              <MdArticle className="admin-account-menu-icon" />
              <span>Site Content</span>
            </Link>

            {isSuperAdmin && (
              <Link
                to="/admin/superadmin"
                className="admin-account-menu-item"
                onClick={() => setShowAccountMenu(false)}
              >
                <MdAdminPanelSettings className="admin-account-menu-icon" />
                <span>Super Admin</span>
              </Link>
            )}

            <button 
              className="admin-account-menu-item"
              onClick={handleLogout}
            >
              <MdLogout className="admin-account-menu-icon" />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="admin-mobile-navbar">
        <Link 
          to="/admin/dashboard" 
          className={`admin-mobile-nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
        >
          <div className="admin-mobile-nav-icon">
            <MdDashboard />
          </div>
          <span className="admin-mobile-nav-label">Dashboard</span>
        </Link>

        <Link 
          to="/admin/inventory" 
          className={`admin-mobile-nav-item ${isActive('/admin/inventory') ? 'active' : ''}`}
        >
          <div className="admin-mobile-nav-icon">
            <MdInventory />
            {products.length > 0 && (
              <span className="admin-mobile-nav-badge">{products.length}</span>
            )}
          </div>
          <span className="admin-mobile-nav-label">Products</span>
        </Link>

        <Link 
          to="/admin/add-product" 
          className={`admin-mobile-nav-item ${isActive('/admin/add-product') ? 'active' : ''}`}
        >
          <div className="admin-mobile-nav-icon">
            <MdAddCircle />
          </div>
          <span className="admin-mobile-nav-label">Add Product</span>
        </Link>

        <Link 
          to="/admin/orders" 
          className={`admin-mobile-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
        >
          <div className="admin-mobile-nav-icon">
            <MdShoppingCart />
            {pendingOrdersCount > 0 && (
              <span className="admin-mobile-nav-badge admin-mobile-nav-badge-warning">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="admin-mobile-nav-label">Orders</span>
        </Link>

        <button 
          className="admin-mobile-nav-item"
          onClick={toggleAccountMenu}
        >
          <div className="admin-mobile-nav-icon">
            <MdAccountCircle />
          </div>
          <span className="admin-mobile-nav-label">Account</span>
        </button>
      </nav>
    </>
  );
};

export default AdminMobileNavbar;