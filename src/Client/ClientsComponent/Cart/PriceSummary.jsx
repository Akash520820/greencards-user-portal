// PriceSummary.jsx
import React, { memo } from 'react';

const PriceSummary = memo(({ 
  subtotal, 
  platformFee, 
  handlingFee, 
  tax, 
  total 
}) => {
  return (
    <div className="price-summary-card">
      <h4 className="summary-title">Price Summary</h4>
      
      <div className="summary-content">
        <div className="summary-item">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="summary-item">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {handlingFee > 0 && (
          <div className="summary-item highlight">
            <span>Handling Fee (COD)</span>
            <span>₹{handlingFee}</span>
          </div>
        )}

        <div className="summary-item">
          <span>Tax (2%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        <div className="summary-divider"></div>

        <div className="summary-item total">
          <span>Total Amount</span>
          <span className="total-amount">₹{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="cashback-badge">
        <div className="badge-icon">🎁</div>
        <div className="badge-content">
          <strong>5% Cashback</strong>
          <p>Claim with payment offers</p>
        </div>
      </div>
    </div>
  );
});

PriceSummary.displayName = 'PriceSummary';

export default PriceSummary;