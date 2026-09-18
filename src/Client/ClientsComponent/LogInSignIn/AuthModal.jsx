import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthModalBackdrop from './AuthModalBackdrop';
import AuthModalContent from './AuthModalContent';
import { useCart } from '../../../context/CartContext';
import './AuthModal.css';

const AuthModal = ({ show, onClose, redirectTo, pendingProduct, onProductAdded }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  // Reset to login mode when modal opens
  useEffect(() => {
    if (show) {
      setIsLogin(true);
    }
  }, [show]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = () => {
    // If there's a pending product, add it to cart
    if (pendingProduct) {
      setTimeout(() => {
        addToCart(pendingProduct);
        if (onProductAdded) {
          onProductAdded();
        }
      }, 300);
    }

    // If there's a redirect path and it's different from current location
    if (redirectTo && redirectTo !== location.pathname) {
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 500);
    }
    
    // Close modal
    onClose();
  };

  if (!show) return null;

  return (
    <>
      <AuthModalBackdrop onClick={onClose} />
      <AuthModalContent 
        isLogin={isLogin}
        onClose={onClose}
        onToggleMode={toggleMode}
        onAuthSuccess={handleAuthSuccess}
        hasPendingProduct={!!pendingProduct}
      />
    </>
  );
};

export default AuthModal;