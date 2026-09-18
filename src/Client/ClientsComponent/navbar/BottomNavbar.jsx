import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoHome } from "react-icons/io5";
import { AiFillProduct } from "react-icons/ai";
import { BsCartFill } from "react-icons/bs";
import { IoBag } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";
import { HiSquares2X2, HiXMark } from "react-icons/hi2";
import { useCart } from '../../../context/CartContext';
import { useClientAuth } from '../../../context/ClientAuthContext';
import { useProducts } from '../../../context/ProductContext';
import { categories as fallbackCategories } from '../../../assets/assets';
import AuthModal from '../LogInSignIn/AuthModal';
import './BottomNavbar.css';

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { isAuthenticated, user, logout } = useClientAuth();
  const { categories: dbCategories } = useProducts();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoriesSheet, setShowCategoriesSheet] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = getTotalItems();
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const displayCategories = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((dbCat) => {
        const match = fallbackCategories.find(
          (f) => f.text.toLowerCase() === dbCat.name.toLowerCase() || f.path.toLowerCase() === dbCat.name.toLowerCase()
        );
        return {
          name: dbCat.name,
          image: dbCat.image || match?.image || fallbackCategories[0].image,
        };
      })
    : fallbackCategories.map((f) => ({ name: f.text, image: f.image }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle redirect after successful login
  useEffect(() => {
    // Only trigger redirect when authentication state changes from false to true
    if (!wasAuthenticatedRef.current && isAuthenticated && pendingRedirect) {
      setIsRedirecting(true);
      
      // Close modal first
      setShowAuthModal(false);
      
      // Show loading overlay and redirect
      setTimeout(() => {
        navigate(pendingRedirect, { replace: true });
        setPendingRedirect(null);
        setIsRedirecting(false);
      }, 500);
    }
    
    // Update the ref
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, pendingRedirect, navigate]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleUserClick = () => {
    if (!isAuthenticated) {
      setPendingRedirect(null);
      setTimeout(() => setShowAuthModal(true), 100);
    } else {
      setShowUserMenu(!showUserMenu);
    }
  };

  const handleCategoriesClick = () => {
    setShowCategoriesSheet((prev) => !prev);
  };

  const handleCategorySelect = (categoryName) => {
    setShowCategoriesSheet(false);
    navigate(`/AllProduct?category=${encodeURIComponent(categoryName)}`);
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setPendingRedirect('/cart');
      setTimeout(() => setShowAuthModal(true), 100);
    }
  };

  const handleOrdersClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setPendingRedirect('/my-orders');
      setTimeout(() => setShowAuthModal(true), 100);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
    setTimeout(() => {
      if (!isAuthenticated) {
        setPendingRedirect(null);
      }
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      {(showUserMenu || showCategoriesSheet) && (
        <div 
          className="bottom-navbar-backdrop show"
          onClick={() => {
            setShowUserMenu(false);
            setShowCategoriesSheet(false);
          }}
        />
      )}

      {/* Page Transition Overlay */}
      {isRedirecting && (
        <div className="page-transition-overlay active">
          <div className="page-transition-spinner"></div>
          <p className="page-transition-text">Redirecting...</p>
        </div>
      )}

      <nav className="bottom-navbar">
        <div className="bottom-navbar-container">
          {/* Home */}
          <Link 
            to="/" 
            className={`bottom-navbar-item ${isActive('/') ? 'active' : ''}`}
          >
            <div className="bottom-navbar-icon-wrapper">
              <IoHome className="bottom-navbar-icon" />
            </div>
            <span className="bottom-navbar-label">Home</span>
          </Link>

          {/* Categories */}
          <button
            type="button"
            className={`bottom-navbar-item ${showCategoriesSheet ? 'active' : ''}`}
            onClick={handleCategoriesClick}
          >
            <div className="bottom-navbar-icon-wrapper">
              <HiSquares2X2 className="bottom-navbar-icon" />
            </div>
            <span className="bottom-navbar-label">Categories</span>
          </button>

          {/* All Products */}
          <Link 
            to="/AllProduct" 
            className={`bottom-navbar-item ${isActive('/AllProduct') ? 'active' : ''}`}
          >
            <div className="bottom-navbar-icon-wrapper">
              <AiFillProduct className="bottom-navbar-icon" />
            </div>
            <span className="bottom-navbar-label">Products</span>
          </Link>

          {/* Cart (Center - Featured) - Now requires login */}
          <Link 
            to="/cart" 
            className={`bottom-navbar-item ${isActive('/cart') ? 'active' : ''}`}
            onClick={handleCartClick}
          >
            <div className="bottom-navbar-icon-wrapper">
              <BsCartFill className="bottom-navbar-icon" />
              {cartCount > 0 && (
                <span className="bottom-navbar-cart-badge">{cartCount}</span>
              )}
            </div>
            <span className="bottom-navbar-label">Cart</span>
          </Link>

          {/* My Orders - Always visible, shows auth modal if not authenticated */}
          <Link 
            to="/my-orders" 
            className={`bottom-navbar-item ${isActive('/my-orders') ? 'active' : ''}`}
            onClick={handleOrdersClick}
          >
            <div className="bottom-navbar-icon-wrapper">
              <IoBag className="bottom-navbar-icon" />
            </div>
            <span className="bottom-navbar-label">Orders</span>
          </Link>

          {/* Account / User */}
          <div className="bottom-navbar-user-dropdown" ref={dropdownRef}>
            <button 
              className={`bottom-navbar-item ${showUserMenu ? 'active' : ''}`}
              onClick={handleUserClick}
            >
              <div className="bottom-navbar-icon-wrapper">
                <MdAccountCircle className="bottom-navbar-icon" />
              </div>
              <span className="bottom-navbar-label">
                {isAuthenticated ? 'Account' : 'Login'}
              </span>
            </button>

            {/* User Dropdown Menu - Only show when authenticated */}
            {showUserMenu && isAuthenticated && (
              <div className={`bottom-navbar-user-menu ${showUserMenu ? 'show' : ''}`}>
                <div className="bottom-navbar-user-header">
                  <div className="bottom-navbar-user-info">
                    <div className="bottom-navbar-user-avatar">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="bottom-navbar-user-details">
                      <p className="bottom-navbar-user-name">{user?.fullName || user?.userName || 'User'}</p>
                      <p className="bottom-navbar-user-email">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="bottom-navbar-menu-item bottom-navbar-logout-btn"
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
        </div>
      </nav>

      {/* Categories Bottom Sheet */}
      <div className={`bottom-navbar-categories-sheet ${showCategoriesSheet ? 'show' : ''}`}>
        <div className="bottom-navbar-categories-header">
          <span>Shop by Category</span>
          <button
            type="button"
            className="bottom-navbar-categories-close"
            onClick={() => setShowCategoriesSheet(false)}
            aria-label="Close categories"
          >
            <HiXMark size={20} />
          </button>
        </div>
        <div className="bottom-navbar-categories-grid">
          {displayCategories.map((cat) => (
            <div
              key={cat.name}
              className="bottom-navbar-category-item"
              onClick={() => handleCategorySelect(cat.name)}
            >
              <img src={cat.image} alt={cat.name} className="bottom-navbar-category-img" />
              <span className="bottom-navbar-category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        show={showAuthModal} 
        onClose={handleCloseAuthModal}
        redirectTo={pendingRedirect}
      />
    </>
  );
};

export default BottomNavbar;