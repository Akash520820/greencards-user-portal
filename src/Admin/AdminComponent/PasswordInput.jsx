import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  placeholder, 
  label = "Password",
  required = true 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleMouseDown = () => {
    setShowPassword(true);
  };

  const handleMouseUp = () => {
    setShowPassword(false);
  };

  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  return (
    <div className="auth-form-input-group">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-form-input"
          style={{ paddingRight: '45px' }}
          required={required}
        />
        <button
          type="button"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: showPassword ? 'rgba(25, 135, 84, 0.1)' : 'none',
            border: 'none',
            cursor: 'pointer',
            color: showPassword ? '#198754' : '#718096',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            borderRadius: '6px',
            userSelect: 'none'
          }}
        >
          {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
        </button>
      </div>
      
    </div>
  );
};

export default React.memo(PasswordInput);