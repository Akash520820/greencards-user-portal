// CartItemsList.jsx - Memoized Cart Items List
import React, { memo } from 'react';
import CartItem from './CartItem';

const CartItemsList = memo(({ 
  items, 
  onQuantityChange, 
  onRemove,
  onClearCart 
}) => {
  return (
    <div className="cart-items-section">
      {items.map((item) => (
        <CartItem
          key={item._id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}

      <button className="clear-cart-btn" onClick={onClearCart}>
        Clear Cart
      </button>
    </div>
  );
});

CartItemsList.displayName = 'CartItemsList';

export default CartItemsList;