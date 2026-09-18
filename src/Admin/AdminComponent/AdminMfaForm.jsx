import React, { useState } from 'react';

// Shown after a password login returns { mfaRequired: true } — the
// account has TOTP enabled, so a 6-digit code from the authenticator app
// is required before a session is actually issued.
const AdminMfaForm = ({ onSubmit, onBack, loading }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-form-input-group">
        <label htmlFor="mfa-code">Authenticator Code</label>
        <input
          id="mfa-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="6-digit code"
          className="auth-form-input"
          autoFocus
          required
        />
      </div>

      <button type="submit" className="auth-form-submit-btn" disabled={loading || code.length !== 6}>
        {loading ? 'Verifying…' : 'Verify'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%',
          marginTop: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#718096',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Back to login
      </button>
    </form>
  );
};

export default AdminMfaForm;
