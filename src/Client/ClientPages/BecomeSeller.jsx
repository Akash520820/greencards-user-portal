// BecomeSeller.jsx
// Lets any logged-in customer apply to sell on the platform, and shows the
// live status of an existing application. Mirrors the backend exactly:
//   POST /seller/apply  — create/re-submit an application (seller.controller.js)
//   GET  /seller/me     — fetch the caller's own SellerProfile
// The account's role only flips to "seller" once an admin approves it
// (see admin.controller.js -> approveSeller), so this page never assumes
// approval — it just reports whatever status the backend returns.
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiXCircle, FiPauseCircle, FiUpload } from 'react-icons/fi';
import { useClientAuth } from '../../context/ClientAuthContext';
import * as sellerApi from '../../api/seller.api';
import './BecomeSeller.css';

const ACCOUNT_TYPES = ['savings', 'current', 'business'];

const EMPTY_FORM = {
  businessName: '',
  gstNumber: '',
  storeDescription: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  bankBranch: '',
  accountType: 'savings',
  upiId: '',
};

// Client-side mirrors of the backend's mongoose validators (sellerProfile.model.js)
// so people get instant feedback instead of a round trip to find out.
const ACCOUNT_NUMBER_RE = /^\d{9,18}$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z]{1}[A-Z\d]$/;

const STATUS_META = {
  pending: {
    icon: <FiClock />,
    color: '#f0ad4e',
    title: 'Application under review',
    text: "We've got your application — an admin will review your bank details and get back to you soon.",
  },
  approved: {
    icon: <FiCheckCircle />,
    color: '#4CAF50',
    title: "You're an approved seller!",
    text: 'Your account now has seller access.',
  },
  rejected: {
    icon: <FiXCircle />,
    color: '#e53e3e',
    title: 'Application rejected',
    text: 'You can update your details below and re-submit.',
  },
  suspended: {
    icon: <FiPauseCircle />,
    color: '#e53e3e',
    title: 'Seller account suspended',
    text: 'Your seller access has been suspended. You can re-submit your details for another review below.',
  },
};

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useClientAuth();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [profile, setProfile] = useState(null); // null = no application found yet
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const res = await sellerApi.getMySellerProfile();
      setProfile(res.data);
    } catch {
      // 404 just means "no application yet" — that's the normal first-visit case
      setProfile(null);
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (user?.role === 'seller') {
      // already an approved, active seller — nothing to apply for
      setCheckingStatus(false);
      return;
    }
    loadStatus();
  }, [authLoading, isAuthenticated, navigate, user, loadStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo size should be less than 5MB');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.businessName.trim()) return 'Business name is required';
    if (!GSTIN_RE.test(form.gstNumber.trim().toUpperCase())) return 'GSTIN must be a valid 15-character number (e.g. 22AAAAA0000A1Z5)';
    if (!form.accountHolderName.trim()) return 'Account holder name is required';
    if (!ACCOUNT_NUMBER_RE.test(form.accountNumber.trim())) return 'Account number must be 9-18 digits';
    if (!IFSC_RE.test(form.ifscCode.trim().toUpperCase())) return 'IFSC code must be valid (e.g. HDFC0001234)';
    if (!form.bankName.trim()) return 'Bank name is required';
    if (!form.bankBranch.trim()) return 'Bank branch is required';
    if (form.upiId && !UPI_RE.test(form.upiId.trim())) return 'UPI ID must be in the form name@bank';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) payload.append(key, key === 'ifscCode' ? value.toUpperCase() : value);
      });
      if (logoFile) payload.append('storeLogo', logoFile);

      const res = await sellerApi.applyForSeller(payload);
      setProfile(res.data);
      toast.success(res.message || 'Application submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || checkingStatus) {
    return (
      <div className="become-seller-page">
        <div className="container become-seller-loading">
          <div className="spinner"></div>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect already fired in the effect above
  }

  if (user?.role === 'seller') {
    return (
      <div className="become-seller-page">
        <div className="container">
          <div className="seller-status-card" style={{ borderColor: STATUS_META.approved.color }}>
            <div className="seller-status-icon" style={{ color: STATUS_META.approved.color }}>
              {STATUS_META.approved.icon}
            </div>
            <h2>{STATUS_META.approved.title}</h2>
            <p>{STATUS_META.approved.text}</p>
            <Link to="/seller/auth" className="seller-status-link">
              Go to seller login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canReapply = profile && (profile.status === 'rejected' || profile.status === 'suspended');
  const showForm = !profile || canReapply;

  return (
    <div className="become-seller-page">
      <Toaster position="top-center" />
      <div className="container">
        <div className="become-seller-header">
          <h1>Sell on GreenCards</h1>
          <p>Apply for a seller account and start listing your own products.</p>
        </div>

        {profile && (
          <div className="seller-status-card" style={{ borderColor: STATUS_META[profile.status].color }}>
            <div className="seller-status-icon" style={{ color: STATUS_META[profile.status].color }}>
              {STATUS_META[profile.status].icon}
            </div>
            <h2>{STATUS_META[profile.status].title}</h2>
            <p>{STATUS_META[profile.status].text}</p>
            {profile.status === 'rejected' && profile.rejectionReason && (
              <p className="seller-status-reason">Reason: {profile.rejectionReason}</p>
            )}
            <div className="seller-status-meta">
              <span>Business: {profile.businessName}</span>
              <span>
                Bank verification:{' '}
                <strong className={`bank-verify-${profile.bankAccountDetails?.verificationStatus}`}>
                  {profile.bankAccountDetails?.verificationStatus}
                </strong>
              </span>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="become-seller-form">
            <h2 className="form-section-title">Business details</h2>

            <div className="bs-form-row">
              <div className="bs-form-group">
                <label htmlFor="businessName">Business name *</label>
                <input
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Green Harvest Traders"
                  required
                />
              </div>
              <div className="bs-form-group">
                <label htmlFor="gstNumber">GST number</label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  required
                />
              </div>
            </div>

            <div className="bs-form-group">
              <label htmlFor="storeDescription">Store description</label>
              <textarea
                id="storeDescription"
                name="storeDescription"
                value={form.storeDescription}
                onChange={handleChange}
                rows="3"
                placeholder="Tell customers what you sell"
              />
            </div>

            <div className="bs-form-group">
              <label htmlFor="storeLogo">Store logo</label>
              <label className="bs-logo-upload">
                {logoPreview ? (
                  <img src={logoPreview} alt="Store logo preview" className="bs-logo-preview" />
                ) : (
                  <span className="bs-logo-placeholder">
                    <FiUpload /> Upload logo
                  </span>
                )}
                <input
                  id="storeLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="bs-file-input"
                />
              </label>
            </div>

            <h2 className="form-section-title">Bank account details</h2>
            <p className="form-section-note">
              Used for payouts. An admin must verify these details before your application can be approved.
            </p>

            <div className="bs-form-row">
              <div className="bs-form-group">
                <label htmlFor="accountHolderName">Account holder name *</label>
                <input
                  id="accountHolderName"
                  name="accountHolderName"
                  value={form.accountHolderName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="bs-form-group">
                <label htmlFor="accountNumber">Account number *</label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  placeholder="9-18 digits"
                  required
                />
              </div>
            </div>

            <div className="bs-form-row">
              <div className="bs-form-group">
                <label htmlFor="ifscCode">IFSC code *</label>
                <input
                  id="ifscCode"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0001234"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
              <div className="bs-form-group">
                <label htmlFor="accountType">Account type</label>
                <select id="accountType" name="accountType" value={form.accountType} onChange={handleChange}>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bs-form-row">
              <div className="bs-form-group">
                <label htmlFor="bankName">Bank name *</label>
                <input id="bankName" name="bankName" value={form.bankName} onChange={handleChange} required />
              </div>
              <div className="bs-form-group">
                <label htmlFor="bankBranch">Bank branch *</label>
                <input id="bankBranch" name="bankBranch" value={form.bankBranch} onChange={handleChange} required />
              </div>
            </div>

            <div className="bs-form-group">
              <label htmlFor="upiId">UPI ID</label>
              <input
                id="upiId"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                placeholder="Optional — e.g. name@okhdfcbank"
              />
            </div>

            <button type="submit" className="bs-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting…' : canReapply ? 'Re-submit Application' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BecomeSeller;
