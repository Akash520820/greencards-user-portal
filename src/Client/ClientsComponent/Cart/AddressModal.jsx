// AddressModal.jsx - With BEM Naming Convention
import React, { memo } from 'react';
import './AddressModal.css';

const AddressModal = memo(({ 
  show,
  addresses,
  selectedAddress,
  newAddress,
  onClose,
  onAddressSelect,
  onAddressChange,
  onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="address-modal-header">
          <h2 className="address-modal-title">Delivery Address</h2>
          <button 
            className="address-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="address-modal-body">
          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <div className="address-modal-saved">
              <h3 className="address-modal-saved-title">Saved Addresses</h3>
              <div className="address-modal-saved-list">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id} 
                    className={`address-modal-card ${selectedAddress?.id === addr.id ? 'address-modal-card--selected' : ''}`}
                    onClick={() => onAddressSelect(addr)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="address-modal-card-radio">
                      {selectedAddress?.id === addr.id && (
                        <div className="address-modal-card-radio-dot"></div>
                      )}
                    </div>
                    <div className="address-modal-card-info">
                      <p className="address-modal-card-name">{addr.fullName}</p>
                      <p className="address-modal-card-text">
                        {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}
                      </p>
                      <p className="address-modal-card-text">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="address-modal-card-phone">{addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add New Address Form */}
          <div className="address-modal-form-section">
            <h3 className="address-modal-form-title">Add New Address</h3>
            <form onSubmit={onSubmit} className="address-modal-form">
              <div className="address-modal-input-group">
                <label htmlFor="fullName" className="address-modal-label">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="address-modal-input"
                  value={newAddress.fullName}
                  onChange={(e) => onAddressChange({...newAddress, fullName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="address-modal-input-group">
                <label htmlFor="phone" className="address-modal-label">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="address-modal-input"
                  value={newAddress.phone}
                  onChange={(e) => onAddressChange({...newAddress, phone: e.target.value})}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="address-modal-input-group">
                <label htmlFor="addressLine1" className="address-modal-label">
                  Address Line 1 *
                </label>
                <input
                  id="addressLine1"
                  type="text"
                  required
                  className="address-modal-input"
                  value={newAddress.addressLine1}
                  onChange={(e) => onAddressChange({...newAddress, addressLine1: e.target.value})}
                  placeholder="House No., Building Name"
                />
              </div>

              <div className="address-modal-input-group">
                <label htmlFor="addressLine2" className="address-modal-label">
                  Address Line 2
                </label>
                <input
                  id="addressLine2"
                  type="text"
                  className="address-modal-input"
                  value={newAddress.addressLine2}
                  onChange={(e) => onAddressChange({...newAddress, addressLine2: e.target.value})}
                  placeholder="Road Name, Area, Colony"
                />
              </div>

              <div className="address-modal-input-row">
                <div className="address-modal-input-group">
                  <label htmlFor="city" className="address-modal-label">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    className="address-modal-input"
                    value={newAddress.city}
                    onChange={(e) => onAddressChange({...newAddress, city: e.target.value})}
                    placeholder="City"
                  />
                </div>

                <div className="address-modal-input-group">
                  <label htmlFor="state" className="address-modal-label">
                    State *
                  </label>
                  <input
                    id="state"
                    type="text"
                    required
                    className="address-modal-input"
                    value={newAddress.state}
                    onChange={(e) => onAddressChange({...newAddress, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="address-modal-input-group">
                <label htmlFor="pincode" className="address-modal-label">
                  Pincode *
                </label>
                <input
                  id="pincode"
                  type="text"
                  required
                  className="address-modal-input"
                  value={newAddress.pincode}
                  onChange={(e) => onAddressChange({...newAddress, pincode: e.target.value})}
                  placeholder="6-digit pincode"
                  pattern="[0-9]{6}"
                />
              </div>

              <button type="submit" className="address-modal-submit">
                Save & Use This Address
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

AddressModal.displayName = 'AddressModal';

export default AddressModal;