import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const FormInput = ({ label, type, name, value, onChange, placeholder, autoComplete, inputMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === 'password';
  const inputId = `auth-field-${name}`;

  const handleMouseDown = () => {
    if (isPasswordField) {
      setShowPassword(true);
    }
  };

  const handleMouseUp = () => {
    if (isPasswordField) {
      setShowPassword(false);
    }
  };

  const handleMouseLeave = () => {
    if (isPasswordField) {
      setShowPassword(false);
    }
  };

  return (
    <div className="auth-form-input-group">
      <label htmlFor={inputId}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          type={isPasswordField && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-form-input"
          style={isPasswordField ? { paddingRight: '45px' } : {}}
          autoComplete={autoComplete}
          inputMode={inputMode}
          spellCheck={type === 'email' || name === 'userName' ? false : undefined}
          required
        />
        {isPasswordField && (
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            {showPassword ? <FiEye size={18} aria-hidden="true" /> : <FiEyeOff size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      
    </div>
  );
};

export default React.memo(FormInput);
