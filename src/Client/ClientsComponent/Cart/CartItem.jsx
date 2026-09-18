// CartItem.jsx - Updated with clickable product
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Add this

const CartItem = memo(({ item, onQuantityChange, onRemove }) => {
  const navigate = useNavigate(); // 👈 Add this

  const discountPercentage = item.offerPrice 
    ? Math.round(((item.price - item.offerPrice) / item.price) * 100)
    : 0;

  const currentPrice = item.offerPrice || item.price;
  const subtotal = currentPrice * item.quantity;

  // 👈 Add click handler
  const handleProductClick = () => {
    navigate(`/product/${item.productId || item._id}`);
  };

  return (
    <div className="cart-item">
      <div 
        className="cart-item-image-wrapper"
        onClick={handleProductClick} // 👈 Make image clickable
        style={{ cursor: 'pointer' }}
      >
        <img src={item.image[0]} alt={item.name} className="cart-item-image" />
      </div>
      
      <div className="cart-item-details">
        <h3 
          className="cart-item-name"
          onClick={handleProductClick} // 👈 Make name clickable
          style={{ cursor: 'pointer' }}
        >
          {item.name}
        </h3>
        <p className="cart-item-category">{item.category}</p>
        
        <div className="cart-item-price">
          {item.offerPrice ? (
            <>
              <span className="cart-item-price-current">₹{item.offerPrice}</span>
              <span className="cart-item-price-original">₹{item.price}</span>
              <span className="cart-item-discount">{discountPercentage}% OFF</span>
            </>
          ) : (
            <span className="cart-item-price-current">₹{item.price}</span>
          )}
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="cart-item-quantity">
          <button 
            className="quantity-btn"
            onClick={() => onQuantityChange(item.cartItemId || item._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => onQuantityChange(item.cartItemId || item._id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div className="cart-item-subtotal">₹{subtotal}</div>

        <button 
          className="cart-item-remove"
          onClick={() => onRemove(item.cartItemId || item._id)}
          aria-label="Remove item"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;