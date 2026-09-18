import React, { memo } from 'react';
import AuthModal from '../LogInSignIn/AuthModal';

const CartLoading = memo(({ showModal, onCloseModal, redirectTo }) => {
  return (
    <>
      <AuthModal 
        show={showModal} 
        onClose={onCloseModal}
        redirectTo={redirectTo}
      />
      <div className="cart-page">
        <div className="container">
          <div className="cart-auth-loading">
            <div className="spinner"></div>
            <p>Please login to view your cart...</p>
          </div>
        </div>
      </div>
    </>
  );
});

CartLoading.displayName = 'CartLoading';

export default CartLoading;