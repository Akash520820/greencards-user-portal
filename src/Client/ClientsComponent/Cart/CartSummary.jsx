import React, { memo } from 'react';

const CartSummary = memo(({ totalPrice, onCheckout, onContinueShopping }) => {
  return (
    <div className="cart-summary-section">
      <div className="cart-summary">
        <h2 className="cart-summary-title">Order Summary</h2>
        
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span>₹{totalPrice}</span>
        </div>
        
        <div className="cart-summary-row">
          <span>Shipping</span>
          <span className="cart-summary-free">FREE</span>
        </div>
        
        <div className="cart-summary-divider"></div>
        
        <div className="cart-summary-row cart-summary-total">
          <span>Total</span>
          <span>₹{totalPrice}</span>
        </div>

        <button className="checkout-btn" onClick={onCheckout}>
          Proceed to Checkout
        </button>

        <button className="continue-shopping-btn" onClick={onContinueShopping}>
          Continue Shopping
        </button>

        <div className="cart-summary-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
});

CartSummary.displayName = 'CartSummary';

export default CartSummary;