import React, { useState } from 'react';
import { HiOutlineShoppingBag, HiArrowRight } from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../context/CartContext';
import { useClientAuth } from '../../../context/ClientAuthContext';
import AuthModal from '../LogInSignIn/AuthModal';
import './CartBadge.css';

const CartBadge = () => {
  const { cartItems, getTotalItems, getTotalPrice } = useCart();
  const { isAuthenticated } = useClientAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const cartCount = getTotalItems();
  const cartTotal = getTotalPrice();

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div
      className="cart-badge-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to="/cart"
        className="cart-badge-trigger"
        onClick={handleCartClick}
        aria-label="Shopping Cart"
      >
        <div className="cart-icon-wrapper">
          <HiOutlineShoppingBag className="cart-bag-icon" size={26} />
          {cartCount > 0 && (
            <motion.span
              className="cart-count-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {cartCount}
            </motion.span>
          )}
        </div>
      </Link>

      {/* Mini-Cart Hover Flyout */}
      <AnimatePresence>
        {isHovered && isAuthenticated && cartCount > 0 && (
          <motion.div
            className="mini-cart-flyout"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mini-cart-header">
              <span className="mini-cart-title">My Cart ({cartCount})</span>
              <span className="mini-cart-total">₹{cartTotal}</span>
            </div>

            <div className="mini-cart-items-list">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item._id} className="mini-cart-item">
                  <img
                    src={Array.isArray(item.image) ? item.image[0] : item.image}
                    alt={item.name}
                    className="mini-cart-item-img"
                  />
                  <div className="mini-cart-item-info">
                    <p className="mini-cart-item-name">{item.name}</p>
                    <p className="mini-cart-item-price">
                      {item.quantity} x ₹{item.offerPrice || item.price}
                    </p>
                  </div>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="mini-cart-more-items">
                  + {cartItems.length - 3} more item{cartItems.length - 3 > 1 ? 's' : ''} in cart
                </p>
              )}
            </div>

            <button
              className="btn btn-success mini-cart-checkout-btn w-100"
              onClick={() => navigate('/cart')}
            >
              Proceed to Cart <HiArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        show={showAuthModal}
        onClose={handleCloseModal}
        redirectTo="/cart"
      />
    </div>
  );
};

export default CartBadge;