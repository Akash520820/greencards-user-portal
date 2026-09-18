import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiShield, FiLock, FiCheck, FiX } from 'react-icons/fi';
import * as staffApi from '../../api/staff.api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminSecuritySettings.css';

const AdminSecuritySettings = () => {
  const { admin } = useAdminAuth();

  // ---- MFA enrollment ----
  const [mfaEnabled, setMfaEnabled] = useState(admin?.mfaEnabled || false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [manualSecret, setManualSecret] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const startEnrollment = async () => {
    setMfaLoading(true);
    try {
      const res = await staffApi.setupMfa();
      setQrCodeDataUrl(res.data.qrCodeDataUrl);
      setManualSecret(res.data.secret);
      setEnrolling(true);
    } catch (err) {
      toast.error(err.message || 'Failed to start MFA setup');
    } finally {
      setMfaLoading(false);
    }
  };

  const confirmEnrollment = async (e) => {
    e.preventDefault();
    setMfaLoading(true);
    try {
      await staffApi.verifyMfaSetup(verifyCode);
      toast.success('Two-factor authentication enabled');
      setMfaEnabled(true);
      setEnrolling(false);
      setQrCodeDataUrl(null);
      setVerifyCode('');
    } catch (err) {
      toast.error(err.message || 'Invalid code — check your authenticator app and try again');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    setMfaLoading(true);
    try {
      await staffApi.disableMfa();
      toast.success('Two-factor authentication disabled');
      setMfaEnabled(false);
    } catch (err) {
      toast.error(err.message || 'Failed to disable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  // ---- Change password ----
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      await staffApi.changeStaffPassword(passwordForm.oldPassword, passwordForm.newPassword);
      toast.success('Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="admin-security-page">
      <Toaster position="top-center" />

      <div className="admin-security-header">
        <div className="admin-security-header-icon"><FiShield /></div>
        <div>
          <h1 className="admin-security-title">Security Settings</h1>
          <p className="admin-security-subtitle">{admin?.fullName} · {admin?.companyEmail}</p>
        </div>
      </div>

      {/* MFA card */}
      <div className="admin-security-card">
        <h2 className="admin-security-card-title">Two-Factor Authentication</h2>
        <p className="admin-security-card-desc">
          Require a 6-digit code from an authenticator app (Google Authenticator, Authy, 1Password, etc.)
          in addition to your password.
        </p>

        {mfaEnabled ? (
          <div className="admin-security-mfa-status enabled">
            <FiCheck /> Two-factor authentication is enabled
            <button className="admin-security-btn danger" onClick={handleDisableMfa} disabled={mfaLoading}>
              Disable
            </button>
          </div>
        ) : enrolling ? (
          <form onSubmit={confirmEnrollment} className="admin-security-mfa-enroll">
            {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="MFA QR code" className="admin-security-qr" />}
            <p className="admin-security-manual-secret">
              Can't scan? Enter this code manually: <code>{manualSecret}</code>
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter the 6-digit code from your app"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              className="admin-security-input"
              required
            />
            <div className="admin-security-row-actions">
              <button type="submit" className="admin-security-btn primary" disabled={mfaLoading || verifyCode.length !== 6}>
                Confirm &amp; Enable
              </button>
              <button
                type="button"
                className="admin-security-btn"
                onClick={() => { setEnrolling(false); setQrCodeDataUrl(null); }}
              >
                <FiX /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="admin-security-btn primary" onClick={startEnrollment} disabled={mfaLoading}>
            {mfaLoading ? 'Starting…' : 'Enable Two-Factor Authentication'}
          </button>
        )}
      </div>

      {/* Change password card */}
      <div className="admin-security-card">
        <h2 className="admin-security-card-title"><FiLock /> Change Password</h2>
        <form onSubmit={handlePasswordChange} className="admin-security-password-form">
          <input
            type="password"
            placeholder="Current password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
            className="admin-security-input"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            className="admin-security-input"
            minLength={8}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
            className="admin-security-input"
            minLength={8}
            required
          />
          <button type="submit" className="admin-security-btn primary" disabled={passwordLoading}>
            {passwordLoading ? 'Updating…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSecuritySettings;
