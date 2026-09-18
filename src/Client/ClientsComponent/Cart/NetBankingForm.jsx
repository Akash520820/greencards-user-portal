// NetBankingForm.jsx
import React, { memo, useState } from 'react';

const banks = [
  { id: 'sbi', name: 'State Bank of India', icon: '🏦' },
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', icon: '🏦' },
  { id: 'axis', name: 'Axis Bank', icon: '🏦' },
  { id: 'pnb', name: 'Punjab National Bank', icon: '🏦' },
  { id: 'bob', name: 'Bank of Baroda', icon: '🏦' },
  { id: 'canara', name: 'Canara Bank', icon: '🏦' },
];

const NetBankingForm = memo(({ onSubmit, totalAmount }) => {
  const [selectedBank, setSelectedBank] = useState('');

  const handleSubmit = () => {
    if (!selectedBank) {
      alert('Please select a bank');
      return;
    }
    onSubmit({ bank: selectedBank });
  };

  return (
    <div className="payment-form-container">
      <div className="form-header">
        <h3>Select Your Bank</h3>
      </div>
      
      <div className="form-content">
        <div className="bank-grid">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className={`bank-option ${selectedBank === bank.id ? 'selected' : ''}`}
              onClick={() => setSelectedBank(bank.id)}
            >
              <div className="bank-radio">
                {selectedBank === bank.id && <div className="radio-dot"></div>}
              </div>
              <span className="bank-icon">{bank.icon}</span>
              <span className="bank-name">{bank.name}</span>
            </div>
          ))}
        </div>

        <button 
          className="submit-payment-btn netbanking-btn"
          onClick={handleSubmit}
          disabled={!selectedBank}
        >
          Pay ₹{totalAmount}
        </button>
      </div>
    </div>
  );
});

NetBankingForm.displayName = 'NetBankingForm';

export default NetBankingForm;