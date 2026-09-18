import React from 'react';
import PasswordInput from './PasswordInput';

// Sellers can't self-register here — an account becomes a seller only after
// applying at /become-seller and being approved by an admin — so this form
// is login-only.
const SellerAuthForm = ({ formData, loading, handleChange, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-form-input-group">
        <label htmlFor="email">Email or Username</label>
        <input
          id="email"
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email or username"
          className="auth-form-input"
          required
        />
      </div>

      <PasswordInput
        id="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        label="Password"
        required
      />

      <button type="submit" className="auth-form-submit-btn" disabled={loading}>
        {loading ? 'Please wait…' : 'Login'}
      </button>
    </form>
  );
};

export default SellerAuthForm;
