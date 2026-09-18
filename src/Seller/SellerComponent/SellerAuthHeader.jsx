import React from 'react';
import { useNavigate } from 'react-router-dom';

const SellerAuthHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="seller-auth-header">
      <h3 className="seller-auth-title">
        <span className="text-success">Seller</span> Login
      </h3>
      <button
        className="seller-auth-back-btn"
        onClick={() => navigate('/')}
        title="Back to Home"
        aria-label="Back to Home"
      >
        ×
      </button>
    </div>
  );
};

export default SellerAuthHeader;
