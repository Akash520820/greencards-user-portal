// CardPaymentForm.jsx
import React, { memo, useState } from 'react';

const CardPaymentForm = memo(({ onSubmit, totalAmount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Enter valid 16-digit card number';
    }
    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Enter valid expiry (MM/YY)';
    }
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Enter valid CVV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ 
        cardNumber, 
        expiry, 
        cvv,
        lastFourDigits: cardNumber.slice(-4) 
      });
    }
  };

  return (
    <div className="payment-form-container">
      <div className="form-header">
        <h3>Card Details</h3>
      </div>

      <div className="alert-box">
        <strong>Note:</strong> Please ensure your card is enabled for online transactions. 
        <a href="#"> Learn More</a>
      </div>
      
      <div className="form-content">
        <div className="input-group">
          <label>Card Number</label>
          <input
            type="text"
            placeholder="XXXX XXXX XXXX XXXX"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength="19"
            className={errors.cardNumber ? 'input-error' : ''}
          />
          {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
        </div>

        <div className="input-row">
          <div className="input-group">
            <label>Valid Thru</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength="5"
              className={errors.expiry ? 'input-error' : ''}
            />
            {errors.expiry && <span className="error-message">{errors.expiry}</span>}
          </div>

          <div className="input-group">
            <label>CVV</label>
            <input
              type="password"
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
              maxLength="3"
              className={errors.cvv ? 'input-error' : ''}
            />
            {errors.cvv && <span className="error-message">{errors.cvv}</span>}
          </div>
        </div>

        <button 
          className="submit-payment-btn card-btn"
          onClick={handleSubmit}
        >
          Pay ₹{totalAmount}
        </button>
      </div>
    </div>
  );
});

CardPaymentForm.displayName = 'CardPaymentForm';

export default CardPaymentForm;