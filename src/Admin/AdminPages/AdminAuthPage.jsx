import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminAuthHeader from '../AdminComponent/AdminAuthHeader';
import AdminAuthForm from '../AdminComponent/AdminAuthForm';
import AdminMfaForm from '../AdminComponent/AdminMfaForm';
import ErrorMessage from '../AdminComponent/ErrorMessage';
import './AdminAuthPage.css';

const AdminAuthPage = () => {
  const navigate = useNavigate();
  const { adminLogin, adminVerifyMfa } = useAdminAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set once password login responds with { mfaRequired: true } — switches
  // the page over to the "enter your authenticator code" step.
  const [pendingMfaStaffId, setPendingMfaStaffId] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminLogin(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || 'Authentication failed');
        return;
      }

      if (result.mfaRequired) {
        setPendingMfaStaffId(result.staffId);
        return;
      }

      navigate('/admin/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (code) => {
    setLoading(true);
    setError('');

    try {
      const result = await adminVerifyMfa(pendingMfaStaffId, code);
      if (result.success) {
        navigate('/admin/dashboard');
      } else {
        setError(result.error || 'Invalid or expired code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-container">
        <div className="admin-auth-content">
          <AdminAuthHeader isLogin={true} />
          <ErrorMessage error={error} />
          {pendingMfaStaffId ? (
            <AdminMfaForm
              onSubmit={handleMfaSubmit}
              onBack={() => {
                setPendingMfaStaffId(null);
                setError('');
              }}
              loading={loading}
            />
          ) : (
            <AdminAuthForm
              formData={formData}
              loading={loading}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
