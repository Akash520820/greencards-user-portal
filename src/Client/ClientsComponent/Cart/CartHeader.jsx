// CartHeader.jsx - Memoized Cart Header
import React, { memo } from 'react';

const CartHeader = memo(({ itemCount }) => {
  return (
    <div className="cart-header">
      <h1 className="cart-title">Shopping Cart</h1>
      <p className="cart-subtitle">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>
    </div>
  );
});

CartHeader.displayName = 'CartHeader';

export default CartHeader;