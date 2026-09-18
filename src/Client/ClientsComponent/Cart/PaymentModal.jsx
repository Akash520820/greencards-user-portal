// PaymentModal.jsx - Updated with unified scrolling layout
import React, { useState, useMemo } from 'react';
import PaymentMethodCard from './PaymentMethodCard';
import UPIPaymentForm from './UPIPaymentForm';
import CardPaymentForm from './CardPaymentForm';
import NetBankingForm from './NetBankingForm';
import CODForm from './CODForm';
import PriceSummary from './PriceSummary';
import './PaymentModal.css';

const PaymentModal = ({ show, onClose, orderTotal, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const platformFee = 5;
  const handlingFee = selectedMethod === 'cod' ? 9 : 0;
  const tax = orderTotal * 0.02;
  const total = orderTotal + platformFee + handlingFee + tax;

  const paymentMethods = useMemo(() => [
    {
      id: 'upi',
      icon: '📱',
      title: 'UPI',
      description: 'Pay by any UPI app',
      offer: 'Get upto ₹20 cashback • 3 offers available'
    },
    {
      id: 'card',
      icon: '💳',
      title: 'Credit / Debit / ATM Card',
      description: 'Add and secure cards as per RBI guidelines',
      offer: 'Get upto 5% cashback • 2 offers available'
    },
    {
      id: 'netbanking',
      icon: '🏦',
      title: 'Net Banking',
      description: 'Select your bank to pay',
      offer: null
    },
    {
      id: 'cod',
      icon: '💵',
      title: 'Cash on Delivery',
      description: 'Pay when you receive',
      offer: null
    }
  ], []);

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handlePaymentSubmit = (paymentDetails) => {
    onPaymentComplete({
      method: selectedMethod,
      amount: total,
      details: paymentDetails,
    });
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  if (!show) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div 
        className={`payment-modal ${selectedMethod ? 'has-selection' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="payment-header">
          {selectedMethod && (
            <button className="back-button" onClick={handleBack} aria-label="Back to payment methods">
              ←
            </button>
          )}
          <h2 className="payment-title">Complete Payment</h2>
          <button className="close-button" onClick={onClose} aria-label="Close payment modal">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="payment-content">
          {/* Payment Methods Selection */}
          {!selectedMethod && (
            <div className="methods-section">
              <div className="methods-list">
                {paymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    icon={method.icon}
                    title={method.title}
                    description={method.description}
                    offer={method.offer}
                    isSelected={false}
                    onClick={() => handleMethodSelect(method.id)}
                  />
                ))}
              </div>

              <div className="select-prompt">
                <div className="prompt-icon">👆</div>
                <p>Select a payment method to continue</p>
              </div>
            </div>
          )}

          {/* Payment Forms with Inline Price Summary */}
          {selectedMethod && (
            <>
              {selectedMethod === 'upi' && (
                <UPIPaymentForm 
                  onSubmit={handlePaymentSubmit}
                  totalAmount={total.toFixed(2)}
                />
              )}

              {selectedMethod === 'card' && (
                <CardPaymentForm 
                  onSubmit={handlePaymentSubmit}
                  totalAmount={total.toFixed(2)}
                />
              )}

              {selectedMethod === 'netbanking' && (
                <NetBankingForm 
                  onSubmit={handlePaymentSubmit}
                  totalAmount={total.toFixed(2)}
                />
              )}

              {selectedMethod === 'cod' && (
                <CODForm 
                  onSubmit={handlePaymentSubmit}
                  totalAmount={total.toFixed(2)}
                  handlingFee={handlingFee}
                  hideButton={true}
                />
              )}

              {/* Price Summary - Inline after payment form */}
              <div className="inline-price-summary">
                <PriceSummary
                  subtotal={orderTotal}
                  platformFee={platformFee}
                  handlingFee={handlingFee}
                  tax={tax}
                  total={total}
                />
                
                {/* Place Order Button for COD */}
                {selectedMethod === 'cod' && (
                  <button 
                    className="submit-payment-btn cod-btn"
                    onClick={() => handlePaymentSubmit({ method: 'cod' })}
                  >
                    Place Order - Pay ₹{total.toFixed(2)} on Delivery
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Secure Badge */}
        <div className="secure-badge">
          🔒 100% Secure Payment
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;