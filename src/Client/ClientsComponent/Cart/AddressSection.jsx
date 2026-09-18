// AddressSection.jsx - Memoized Address Section Component
import React, { memo } from 'react';

const AddressSection = memo(({ 
  selectedAddress, 
  onChangeAddress 
}) => {
  return (
    <div className="checkout-section">
      <div className="checkout-section-header">
        <h3>DELIVERY ADDRESS</h3>
        {selectedAddress && (
          <button 
            className="change-link"
            onClick={onChangeAddress}
          >
            Change
          </button>
        )}
      </div>
      
      {selectedAddress ? (
        <div className="selected-address">
          <p className="address-name">{selectedAddress.fullName}</p>
          <p className="address-text">
            {selectedAddress.addressLine1}
            {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
          </p>
          <p className="address-text">
            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
          </p>
          <p className="address-phone">Phone: {selectedAddress.phone}</p>
        </div>
      ) : (
        <div className="no-address">
          <p>No address found</p>
          <button 
            className="add-address-btn"
            onClick={onChangeAddress}
          >
            Add Address
          </button>
        </div>
      )}
    </div>
  );
});

AddressSection.displayName = 'AddressSection';

export default AddressSection;