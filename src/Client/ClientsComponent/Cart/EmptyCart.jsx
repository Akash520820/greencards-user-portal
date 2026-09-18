import React, { memo } from 'react';

const EmptyCart = memo(({ onStartShopping }) => {
  return (
    <div className="cart-page">
      <div className="container">
        <div className="empty-cart">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2 className="empty-cart-title">Your Cart is Empty</h2>
          <p className="empty-cart-text">Looks like you haven't added anything to your cart yet</p>
          <button className="empty-cart-btn" onClick={onStartShopping}>
            Start Shopping
          </button>
        </div>
      </div>
    </div>
  );
});

EmptyCart.displayName = 'EmptyCart';

export default EmptyCart;