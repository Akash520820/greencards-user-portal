import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSellerAuth } from '../../context/SellerAuthContext';
import SellerAuthHeader from '../SellerComponent/SellerAuthHeader';
import SellerAuthForm from '../SellerComponent/SellerAuthForm';
import ErrorMessage from '../SellerComponent/ErrorMessage';
import './SellerAuthPage.css';

const SellerAuthPage = () => {
  const navigate = useNavigate();
  const { sellerLogin } = useSellerAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const result = await sellerLogin(formData.email, formData.password);
      if (result.success) {
        navigate('/seller/dashboard');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-auth-page">
      <div className="seller-auth-container">
        <div className="seller-auth-content">
          <SellerAuthHeader />
          <ErrorMessage error={error} />
          <SellerAuthForm
            formData={formData}
            loading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
          />
          <p className="auth-form-toggle-text">
            Not a seller yet?{' '}
            <Link to="/become-seller" className="auth-form-toggle-link">
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerAuthPage;
