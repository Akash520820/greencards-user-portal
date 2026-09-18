// UPIPaymentForm.jsx
import React, { memo, useState } from 'react';

const UPIPaymentForm = memo(({ onSubmit, totalAmount }) => {
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');

  const validateUPI = () => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiId) {
      setError('UPI ID is required');
      return false;
    }
    if (!upiRegex.test(upiId)) {
      setError('Invalid UPI ID format (e.g., username@paytm)');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateUPI()) {
      onSubmit({ upiId });
    }
  };

  return (
    <div className="payment-form-container">
      <div className="form-header">
        <h3>Enter UPI ID</h3>
        <a href="#" className="help-link">How to find?</a>
      </div>
      
      <div className="form-content">
        <div className="input-group">
          <label>UPI ID</label>
          <div className="input-with-action">
            <input
              type="text"
              placeholder="username@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={error ? 'input-error' : ''}
            />
            <button 
              className="verify-button"
              onClick={validateUPI}
            >
              Verify
            </button>
          </div>
          {error && <span className="error-message">{error}</span>}
        </div>

        <div className="payment-info-box">
          <p className="info-text">
            💳 UPI payments are instant and secure
          </p>
        </div>

        <button 
          className="submit-payment-btn upi-btn"
          onClick={handleSubmit}
        >
          Pay ₹{totalAmount}
        </button>
      </div>
    </div>
  );
});

UPIPaymentForm.displayName = 'UPIPaymentForm';

export default UPIPaymentForm;