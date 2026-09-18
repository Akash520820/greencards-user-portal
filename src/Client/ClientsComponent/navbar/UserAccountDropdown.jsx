import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientAuth } from '../../../context/ClientAuthContext';
import './UserAccountDropdown.css';

const UserAccountDropdown = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useClientAuth();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when dropdown is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className={`user-dropdown-backdrop ${isOpen ? 'show' : ''}`}
          onClick={handleBackdropClick}
        />
      )}
      
      <div className="user-account-dropdown" ref={dropdownRef}>
        <button 
          className="user-account-dropdown-btn" 
          onClick={toggleDropdown}
          aria-label="User account"
        >
          <div className="user-account-dropdown-icon-circle">
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className={`user-account-dropdown-menu ${isOpen ? 'show' : ''}`}>
            <div className="user-account-dropdown-header">
              <div className="user-account-dropdown-info">
                <div className="user-account-dropdown-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-account-dropdown-details">
                  <p className="user-account-dropdown-name">{user?.name || 'User'}</p>
                  <p className="user-account-dropdown-email">{user?.email || ''}</p>
                </div>
              </div>
            </div>
            
            <div className="user-account-dropdown-divider"></div>
            
            {/* Only show My Orders link on desktop */}
            {!isMobile && (
              <Link 
                to="/my-orders" 
                className="user-account-dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                My Orders
              </Link>
            )}

            {/* Selling is only relevant to plain customers — an approved
                seller/admin/superadmin has no use for the application page */}
            {user?.role === 'user' && (
              <Link
                to="/become-seller"
                className="user-account-dropdown-item"
                onClick={() => setIsOpen(false)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-3V6a4 4 0 0 0-8 0v1H6a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1zM9 6a3 3 0 0 1 6 0v1H9V6z" />
                </svg>
                Sell on GreenCards
              </Link>
            )}

            {(user?.role === 'seller' || user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link
                to="/seller/dashboard"
                className="user-account-dropdown-item"
                onClick={() => setIsOpen(false)}
                style={{ color: '#047857', fontWeight: '600' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Seller Studio Dashboard
              </Link>
            )}

            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <Link
                to="/admin/dashboard"
                className="user-account-dropdown-item"
                onClick={() => setIsOpen(false)}
                style={{ color: '#10b981', fontWeight: '600' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Admin Command Center
              </Link>
            )}
            
            <button 
              className="user-account-dropdown-item user-account-dropdown-logout-btn"
              onClick={handleLogout}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserAccountDropdown;