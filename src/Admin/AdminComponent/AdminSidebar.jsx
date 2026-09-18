import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  FiShoppingBag,
  FiGrid,
  FiPackage,
  FiPlusCircle,
  FiClipboard,
  FiLogOut,
  FiUser,
  FiMail,
  FiBarChart2,
  FiShield,
  FiUserCheck,
  FiFlag,
  FiFileText,
  FiLock
} from 'react-icons/fi';

import './AdminSidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, adminLogout } = useAdminAuth();
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const popupRef = useRef(null);
  const isSuperAdmin = admin?.role === 'superadmin';
  const displayName = admin?.fullName || admin?.userName || 'Admin';
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';

  const handleLogout = () => {
    setShowAccountPopup(false);
    adminLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const toggleAccountPopup = () => {
    setShowAccountPopup(!showAccountPopup);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowAccountPopup(false);
      }
    };

    if (showAccountPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountPopup]);

  // Close popup on route change
  useEffect(() => {
    setShowAccountPopup(false);
  }, [location.pathname]);

  return (
    <aside className="sidebar-container">
      {/* Sidebar Header - Clickable for Account Popup */}
      <div 
        className="sidebar-header sidebar-header-clickable"
        onClick={toggleAccountPopup}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleAccountPopup()}
      >
        <div className="sidebar-header-icon">
          {isSuperAdmin ? <FiShield /> : <FiShoppingBag />}
        </div>
        <h2 className="sidebar-header-title">{roleLabel} Panel</h2>
        <p className="sidebar-header-shop-name">
          {displayName}
        </p>
        <small className="sidebar-header-email">
          {admin?.companyEmail || ''}
        </small>
        
        {/* Hover hint */}
        <span className="sidebar-header-hint">Click for account options</span>
      </div>

      {/* Account Popup */}
      {showAccountPopup && (
        <>
          <div 
            className="sidebar-popup-overlay" 
            onClick={() => setShowAccountPopup(false)}
          />
          <div className="sidebar-account-popup" ref={popupRef}>
            {/* Popup Header */}
            <div className="sidebar-popup-header">
              <div className="sidebar-popup-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-popup-info">
                <h3 className="sidebar-popup-name">{displayName}</h3>
                <p className="sidebar-popup-role">{roleLabel} Account</p>
              </div>
            </div>

            {/* Popup Details */}
            <div className="sidebar-popup-details">
              <div className="sidebar-popup-detail-item">
                <FiMail className="sidebar-popup-detail-icon" />
                <span>{admin?.companyEmail || '—'}</span>
              </div>
              <div className="sidebar-popup-detail-item">
                <FiUser className="sidebar-popup-detail-icon" />
                <span>{admin?.employeeId || '—'}</span>
              </div>
            </div>

            {/* Popup Actions */}
            <div className="sidebar-popup-actions">
              <button 
                className="sidebar-popup-logout-btn"
                onClick={handleLogout}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <Link 
          to="/admin/dashboard" 
          className={`sidebar-nav-link ${isActive('/admin/dashboard') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiGrid className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Dashboard</span>
        </Link>
        
        <Link 
          to="/admin/orders" 
          className={`sidebar-nav-link ${isActive('/admin/orders') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiPackage className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Orders</span>
        </Link>
        
        <Link 
          to="/admin/add-product" 
          className={`sidebar-nav-link ${isActive('/admin/add-product') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiPlusCircle className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Add Product</span>
        </Link>
        
        <Link 
          to="/admin/inventory" 
          className={`sidebar-nav-link ${isActive('/admin/inventory') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiClipboard className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Inventory</span>
        </Link>
        <Link 
          to="/admin/analytics" 
          className={`sidebar-nav-link ${isActive('/admin/analytics') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiBarChart2 className="sidebar-nav-icon" /> 
          <span className="sidebar-nav-text">Sales Analytics</span>
        </Link>

        <Link
          to="/admin/seller-applications"
          className={`sidebar-nav-link ${isActive('/admin/seller-applications') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiUserCheck className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Seller Applications</span>
        </Link>

        <Link
          to="/admin/reported-reviews"
          className={`sidebar-nav-link ${isActive('/admin/reported-reviews') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiFlag className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Reported Reviews</span>
        </Link>

        <Link
          to="/admin/site-content"
          className={`sidebar-nav-link ${isActive('/admin/site-content') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiFileText className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Site Content</span>
        </Link>

        <Link
          to="/admin/security"
          className={`sidebar-nav-link ${isActive('/admin/security') ? 'sidebar-nav-link-active' : ''}`}
        >
          <FiLock className="sidebar-nav-icon" />
          <span className="sidebar-nav-text">Security Settings</span>
        </Link>

        {isSuperAdmin && (
          <Link
            to="/admin/superadmin"
            className={`sidebar-nav-link sidebar-nav-link-superadmin ${isActive('/admin/superadmin') ? 'sidebar-nav-link-active' : ''}`}
          >
            <FiShield className="sidebar-nav-icon" />
            <span className="sidebar-nav-text">Super Admin</span>
          </Link>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button 
          onClick={handleLogout} 
          className="sidebar-logout-btn btn btn-danger w-100"
        >
          <FiLogOut style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;