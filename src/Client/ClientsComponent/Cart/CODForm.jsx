// CODForm.jsx - Updated to support optional button hiding
import React, { memo } from 'react';

const CODForm = memo(({ onSubmit, totalAmount, handlingFee, hideButton = false }) => {
  return (
    <div className="payment-form-container">
      <div className="form-header">
        <h3>Cash on Delivery</h3>
      </div>
      
      <div className="form-content">
        <div className="cod-info-card">
          <div className="cod-icon">💵</div>
          <h4>Pay when you receive</h4>
          <p>
            Due to handling costs, a nominal fee of ₹{handlingFee} will be charged for orders 
            placed using this option.
          </p>
          <div className="cod-tip">
            💡 <strong>Tip:</strong> Avoid this fee by paying online now
          </div>
        </div>

        <div className="fee-breakdown">
          <div className="fee-row">
            <span>Order Total</span>
            <span>₹{(totalAmount - handlingFee).toFixed(2)}</span>
          </div>
          <div className="fee-row highlight">
            <span>Handling Fee</span>
            <span>₹{handlingFee}</span>
          </div>
          <div className="fee-divider"></div>
          <div className="fee-row total">
            <span>Amount to Pay</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        {/* Only show button if hideButton is false */}
        {!hideButton && (
          <button 
            className="submit-payment-btn cod-btn"
            onClick={() => onSubmit({ method: 'cod' })}
          >
            Place Order - Pay ₹{totalAmount} on Delivery
          </button>
        )}
      </div>
    </div>
  );
});

CODForm.displayName = 'CODForm';

export default CODForm;