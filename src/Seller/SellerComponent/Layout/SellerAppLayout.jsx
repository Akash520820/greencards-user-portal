import React, { useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { HiPlus, HiBell, HiMagnifyingGlass, HiCheckBadge, HiBuildingStorefront, HiArrowLeftOnRectangle } from 'react-icons/hi2';
import { useSellerAuth } from '../../../context/SellerAuthContext';
import SellerSidebar from '../SellerSidebar';
import './SellerAppLayout.css';

const SellerAppLayout = () => {
  const { seller, sellerLogout } = useSellerAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await sellerLogout();
    navigate('/seller/auth');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/seller/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="seller-layout-shell">
      <SellerSidebar />
      <div className="seller-layout-main">
        <header className="seller-layout-topbar">
          <div className="seller-topbar-left">
            <div className="seller-store-badge">
              <HiBuildingStorefront size={18} className="seller-store-icon" />
              <span className="seller-store-name">{seller?.storeName || seller?.fullName || 'Seller Studio'}</span>
              <span className="seller-status-pill">
                <HiCheckBadge size={14} /> Verified
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="seller-search-form">
              <HiMagnifyingGlass className="seller-search-icon" size={18} />
              <input
                type="text"
                className="seller-search-input"
                placeholder="Search products, SKUs, inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </div>

          <div className="seller-topbar-right">
            <button
              type="button"
              className="seller-add-product-btn"
              onClick={() => navigate('/seller/add-product')}
            >
              <HiPlus size={16} /> Add Product
            </button>

            <button type="button" className="seller-notify-btn" title="Notifications">
              <HiBell size={20} />
              <span className="seller-notify-badge">2</span>
            </button>

            <Link to="/" className="seller-switch-customer-btn" title="Back to Customer Store">
              Main Store
            </Link>

            <button type="button" className="seller-layout-logout-btn" onClick={handleLogout} title="Logout">
              <HiArrowLeftOnRectangle size={18} />
            </button>
          </div>
        </header>

        <main className="seller-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerAppLayout;
