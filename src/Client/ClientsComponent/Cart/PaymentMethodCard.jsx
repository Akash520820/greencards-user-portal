// PaymentMethodCard.jsx
import React, { memo } from 'react';

const PaymentMethodCard = memo(({ 
  icon, 
  title, 
  description, 
  offer, 
  isSelected, 
  onClick 
}) => {
  return (
    <div 
      className={`payment-method-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="payment-icon">{icon}</div>
      <div className="payment-info">
        <h4>{title}</h4>
        <p>{description}</p>
        {offer && <span className="payment-offer">{offer}</span>}
      </div>
      <div className="payment-radio">
        {isSelected && <div className="radio-checked"></div>}
      </div>
    </div>
  );
});

PaymentMethodCard.displayName = 'PaymentMethodCard';

export default PaymentMethodCard;