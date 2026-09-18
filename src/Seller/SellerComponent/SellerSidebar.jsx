import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSellerAuth } from '../../context/SellerAuthContext';
import './SellerSidebar.css';

const NAV_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/seller/products', label: 'My Products', icon: '📦' },
  { to: '/seller/orders', label: 'Orders', icon: '🧾' },
  { to: '/seller/reviews', label: 'Reviews', icon: '⭐' },
];

const SellerSidebar = () => {
  const { seller, sellerLogout } = useSellerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await sellerLogout();
    navigate('/seller/auth');
  };

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar-brand">
        <span className="text-success">Green</span>Cards Seller
      </div>

      <nav className="seller-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `seller-sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="seller-sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="seller-sidebar-footer">
        <div className="seller-sidebar-user">
          <div className="seller-sidebar-user-name">{seller?.fullName || seller?.userName}</div>
          <div className="seller-sidebar-user-email">{seller?.email}</div>
        </div>
        <button className="seller-sidebar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SellerSidebar;
