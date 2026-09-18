import React from 'react';
import PasswordInput from './PasswordInput';

// Admin accounts can only be granted by a super admin (there is no
// self-service signup), so this form is login-only.
const AdminAuthForm = ({
  formData,
  loading,
  handleChange,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="auth-form-input-group">
        <label htmlFor="email">Company Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@yourcompany.com"
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

      <button
        type="submit"
        className="auth-form-submit-btn"
        disabled={loading}
      >
        {loading ? 'Please wait…' : 'Login'}
      </button>
    </form>
  );
};

export default AdminAuthForm;
