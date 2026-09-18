import React, { useState } from 'react';

const PasswordInput = ({ id, name, value, onChange, placeholder, label, required }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-form-input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="auth-form-password-wrapper">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-form-input"
          required={required}
        />
        <button
          type="button"
          className="auth-form-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
