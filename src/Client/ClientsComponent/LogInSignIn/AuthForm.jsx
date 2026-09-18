import React, { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import FormInput from './FormInput';
import AuthToggleText from './AuthToggleText';
import { useClientAuth } from '../../../context/ClientAuthContext';
import { compressImage } from '../../../utils/compressImage';

const AuthForm = ({ isLogin, onToggleMode, onClose, onAuthSuccess, hasPendingProduct }) => {
  const { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword } = useClientAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [compressingAvatar, setCompressingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Once registration sends an OTP, we switch into this step to collect it.
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // Forgot password flow: 'closed' -> 'email' (request code) -> 'reset' (enter code + new password)
  const [forgotStep, setForgotStep] = useState('closed');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    setCompressingAvatar(true);
    try {
      const compressed = await compressImage(file);
      setAvatarFile(compressed);
      setAvatarPreview(URL.createObjectURL(compressed));
    } catch {
      // If compression fails for any reason, fall back to the original file
      // rather than blocking signup entirely.
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } finally {
      setCompressingAvatar(false);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: '', userName: '', email: '', phone: '', password: '' });
    setAvatarFile(null);
    setAvatarPreview(null);
    setAwaitingOtp(false);
    setOtp('');
    setForgotStep('closed');
    setForgotEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const result = await forgotPassword(forgotEmail);
      if (!result.success) {
        toast.error(result.error || 'Failed to send reset code');
        return;
      }
      toast.success(result.message || 'If an account exists, a reset code has been sent.');
      setForgotStep('reset');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    const result = await forgotPassword(forgotEmail);
    if (result.success) {
      toast.success('Reset code resent!');
    } else {
      toast.error(result.error || 'Failed to resend reset code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const result = await resetPassword(forgotEmail, resetOtp, newPassword);
      if (!result.success) {
        toast.error(result.error || 'Failed to reset password');
        return;
      }
      toast.success(result.message || 'Password reset successfully. Please log in.');
      resetForm();
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // The login field accepts either an email or a username
        const identifier = formData.email;
        const result = await login(identifier, formData.password);
        if (!result.success) {
          toast.error(result.error || 'Login failed');
          return;
        }
        resetForm();
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          onClose();
        }
        return;
      }

      // Signup — step 1: send OTP
      if (!avatarFile) {
        toast.error('Please choose a profile photo to continue');
        return;
      }

      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('userName', formData.userName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('password', formData.password);
      payload.append('avatar', avatarFile);

      const result = await register(payload);
      if (!result.success) {
        toast.error(result.error || 'Registration failed');
        return;
      }

      toast.success('OTP sent to your email!');
      setPendingEmail(result.email || formData.email);
      setAwaitingOtp(true);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await verifyOtp(pendingEmail, otp);
      if (!result.success) {
        toast.error(result.error || 'Invalid OTP');
        return;
      }
      toast.success('Account created! 🎉');
      resetForm();
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp(pendingEmail);
    if (result.success) {
      toast.success('OTP resent!');
    } else {
      toast.error(result.error || 'Failed to resend OTP');
    }
  };

  if (forgotStep === 'email') {
    return (
      <form onSubmit={handleRequestResetCode}>
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#e7f5ec',
          borderRadius: '8px',
          border: '1px solid #4CAF50',
          fontSize: '0.85rem',
          color: '#2E7D32',
          textAlign: 'center'
        }}>
          Enter your email and we'll send you a reset code
        </div>

        <FormInput
          label="Email"
          type="email"
          name="forgotEmail"
          value={forgotEmail}
          onChange={(e) => setForgotEmail(e.target.value)}
          placeholder="type here"
          autoComplete="email"
          inputMode="email"
        />

        <button type="submit" className="auth-form-submit-btn" disabled={forgotLoading}>
          {forgotLoading ? 'Sending…' : 'Send Reset Code'}
        </button>

        <button
          type="button"
          onClick={() => setForgotStep('closed')}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#4CAF50',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </form>
    );
  }

  if (forgotStep === 'reset') {
    return (
      <form onSubmit={handleResetPassword}>
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#e7f5ec',
          borderRadius: '8px',
          border: '1px solid #4CAF50',
          fontSize: '0.85rem',
          color: '#2E7D32',
          textAlign: 'center'
        }}>
          Enter the code sent to {forgotEmail}
        </div>

        <FormInput
          label="Reset Code"
          type="text"
          name="resetOtp"
          value={resetOtp}
          onChange={(e) => setResetOtp(e.target.value)}
          placeholder="6-digit code"
          autoComplete="one-time-code"
          inputMode="numeric"
        />

        <FormInput
          label="New Password"
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="type here"
          autoComplete="new-password"
        />

        <FormInput
          label="Confirm New Password"
          type="password"
          name="confirmNewPassword"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          placeholder="type here"
          autoComplete="new-password"
        />

        <button type="submit" className="auth-form-submit-btn" disabled={forgotLoading}>
          {forgotLoading ? 'Resetting…' : 'Reset Password'}
        </button>

        <button
          type="button"
          onClick={handleResendResetCode}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#4CAF50',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Resend Code
        </button>

        <button
          type="button"
          onClick={() => setForgotStep('closed')}
          style={{
            width: '100%',
            marginTop: '0.25rem',
            background: 'none',
            border: 'none',
            color: '#718096',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </form>
    );
  }

  if (awaitingOtp) {
    return (
      <form onSubmit={handleVerifyOtp}>
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#e7f5ec',
          borderRadius: '8px',
          border: '1px solid #4CAF50',
          fontSize: '0.85rem',
          color: '#2E7D32',
          textAlign: 'center'
        }}>
          Enter the OTP sent to {pendingEmail}
        </div>

        <FormInput
          label="OTP"
          type="text"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit code"
          autoComplete="one-time-code"
          inputMode="numeric"
        />

        <button type="submit" className="auth-form-submit-btn" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify & Create Account'}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            background: 'none',
            border: 'none',
            color: '#4CAF50',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Resend OTP
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {hasPendingProduct && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#e7f5ec',
          borderRadius: '8px',
          border: '1px solid #4CAF50',
          fontSize: '0.85rem',
          color: '#2E7D32',
          textAlign: 'center'
        }}>
          ✓ Login to add this product to your cart
        </div>
      )}

      {!isLogin && (
        <>
          <div className="auth-form-row">
            <FormInput
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="type here"
              autoComplete="name"
            />
            <FormInput
              label="Username"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="type here"
              autoComplete="username"
            />
          </div>
        </>
      )}

      {!isLogin && (
        <div className="auth-form-row">
          <FormInput
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10-digit number"
            autoComplete="tel"
            inputMode="tel"
          />
          <FormInput
            label={isLogin ? 'Email or Username' : 'Email'}
            type={isLogin ? 'text' : 'email'}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="type here"
            autoComplete={isLogin ? 'username' : 'email'}
            inputMode={isLogin ? undefined : 'email'}
          />
        </div>
      )}

      {isLogin && (
        <FormInput
          label={isLogin ? 'Email or Username' : 'Email'}
          type={isLogin ? 'text' : 'email'}
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="type here"
          autoComplete={isLogin ? 'username' : 'email'}
          inputMode={isLogin ? undefined : 'email'}
        />
      )}

      <FormInput
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="type here"
        autoComplete={isLogin ? 'current-password' : 'new-password'}
      />

      {isLogin && (
        <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(formData.email);
              setForgotStep('email');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>
      )}

      {!isLogin && (
        <div className="auth-form-avatar-row">
          <button
            type="button"
            className="auth-form-avatar-picker"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose profile photo"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" />
            ) : (
              <span className="auth-form-avatar-placeholder">+</span>
            )}
          </button>
          <div>
            <span className="auth-form-avatar-label">
              {compressingAvatar
                ? 'Processing photo…'
                : avatarFile
                ? avatarFile.name
                : 'Add a profile photo'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              required
            />
          </div>
        </div>
      )}

      <AuthToggleText 
        isLogin={isLogin}
        onToggle={onToggleMode}
      />

      <button type="submit" className="auth-form-submit-btn" disabled={loading}>
        {loading ? 'Please wait…' : isLogin ? 'Login' : 'Create Account'}
      </button>
    </form>
  );
};

export default React.memo(AuthForm);
