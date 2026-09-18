// SellerApplications.jsx
// Two tabs:
//  - Pending: GET /admin/sellers/pending — approve/reject/verify-bank
//  - Approved: GET /admin/sellers?status=approved — suspend
// The "Approved" tab exists because suspendSeller needs a SellerProfile _id,
// and until GET /admin/sellers was added there was no way to discover the id
// of an already-approved seller.
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiClock, FiPauseCircle } from 'react-icons/fi';
import * as adminApi from '../../api/admin.api';
import './SellerApplications.css';

const VERIFY_COLORS = {
  pending: '#f0ad4e',
  verified: '#2f855a',
  rejected: '#e53e3e',
};

const SellerApplications = () => {
  const [tab, setTab] = useState('pending'); // "pending" | "approved"
  const [applications, setApplications] = useState([]);
  const [approvedSellers, setApprovedSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectDrafts, setRejectDrafts] = useState({});

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getPendingSellers();
      setApplications(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load seller applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApproved = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getSellersByStatus('approved');
      setApprovedSellers(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load approved sellers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'pending') loadPending();
    else loadApproved();
  }, [tab, loadPending, loadApproved]);

  const handleVerifyBank = async (sellerId, verificationStatus) => {
    setBusyId(sellerId);
    try {
      await adminApi.verifyBankDetails(sellerId, verificationStatus);
      toast.success(`Bank details marked as ${verificationStatus}`);
      loadPending();
    } catch (err) {
      toast.error(err.message || 'Failed to update bank verification');
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (sellerId) => {
    setBusyId(sellerId);
    try {
      await adminApi.approveSeller(sellerId);
      toast.success('Seller approved');
      loadPending();
    } catch (err) {
      toast.error(err.message || 'Failed to approve seller');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (sellerId) => {
    const reason = (rejectDrafts[sellerId] || '').trim();
    setBusyId(sellerId);
    try {
      await adminApi.rejectSeller(sellerId, reason || undefined);
      toast.success('Application rejected');
      loadPending();
    } catch (err) {
      toast.error(err.message || 'Failed to reject application');
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspend = async (sellerId) => {
    if (!window.confirm('Suspend this seller? Their account will be reverted to a regular user.')) return;
    setBusyId(sellerId);
    try {
      await adminApi.suspendSeller(sellerId);
      toast.success('Seller suspended');
      loadApproved();
    } catch (err) {
      toast.error(err.message || 'Failed to suspend seller');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="seller-apps-page">
      <Toaster position="top-center" />
      <div className="sa-header">
        <h1>Seller Applications</h1>
        <div className="sa-tabs">
          <button className={`sa-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            Pending
          </button>
          <button className={`sa-tab ${tab === 'approved' ? 'active' : ''}`} onClick={() => setTab('approved')}>
            Approved Sellers
          </button>
        </div>
      </div>

      {error && <p className="sa-error">{error}</p>}

      {loading ? (
        <div className="sa-loading">Loading…</div>
      ) : tab === 'pending' ? (
        applications.length === 0 ? (
          <div className="sa-empty">No pending seller applications right now.</div>
        ) : (
          <div className="sa-list">
            {applications.map((app) => {
              const bank = app.bankAccountDetails;
              const canApprove = bank.verificationStatus === 'verified';
              const isBusy = busyId === app._id;

              return (
                <div key={app._id} className="sa-card">
                  <div className="sa-card-header">
                    <div className="sa-applicant">
                      {app.storeLogo && <img src={app.storeLogo} alt={app.businessName} className="sa-logo" />}
                      <div>
                        <h3>{app.businessName}</h3>
                        <p className="sa-applicant-name">
                          {app.userId?.fullName || app.userId?.userName} · {app.userId?.email}
                        </p>
                        {app.userId?.phone && <p className="sa-applicant-phone">{app.userId.phone}</p>}
                      </div>
                    </div>
                    {app.gstNumber && <span className="sa-gst">GST: {app.gstNumber}</span>}
                  </div>

                  {app.storeDescription && <p className="sa-description">{app.storeDescription}</p>}

                  <div className="sa-bank-section">
                    <div className="sa-bank-header">
                      <h4>Bank Account Details</h4>
                      <span
                        className="sa-verify-badge"
                        style={{ color: VERIFY_COLORS[bank.verificationStatus], borderColor: VERIFY_COLORS[bank.verificationStatus] }}
                      >
                        <FiClock /> {bank.verificationStatus}
                      </span>
                    </div>
                    <div className="sa-bank-grid">
                      <div>
                        <span className="sa-bank-label">Account Holder</span>
                        <span>{bank.accountHolderName}</span>
                      </div>
                      <div>
                        <span className="sa-bank-label">Account Number</span>
                        <span>{bank.accountNumber}</span>
                      </div>
                      <div>
                        <span className="sa-bank-label">IFSC</span>
                        <span>{bank.ifscCode}</span>
                      </div>
                      <div>
                        <span className="sa-bank-label">Bank</span>
                        <span>{bank.bankName}, {bank.bankBranch}</span>
                      </div>
                      <div>
                        <span className="sa-bank-label">Account Type</span>
                        <span className="sa-capitalize">{bank.accountType}</span>
                      </div>
                      {bank.upiId && (
                        <div>
                          <span className="sa-bank-label">UPI</span>
                          <span>{bank.upiId}</span>
                        </div>
                      )}
                    </div>

                    {bank.verificationStatus !== 'verified' && (
                      <div className="sa-bank-actions">
                        <button
                          className="sa-btn sa-btn-verify"
                          disabled={isBusy}
                          onClick={() => handleVerifyBank(app._id, 'verified')}
                        >
                          Mark Bank Verified
                        </button>
                        <button
                          className="sa-btn sa-btn-reject-bank"
                          disabled={isBusy}
                          onClick={() => handleVerifyBank(app._id, 'rejected')}
                        >
                          Reject Bank Details
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sa-decision-section">
                    <button
                      className="sa-btn sa-btn-approve"
                      disabled={isBusy || !canApprove}
                      title={canApprove ? '' : 'Verify bank details before approving'}
                      onClick={() => handleApprove(app._id)}
                    >
                      <FiCheckCircle /> Approve Seller
                    </button>

                    <div className="sa-reject-form">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectDrafts[app._id] || ''}
                        onChange={(e) => setRejectDrafts((prev) => ({ ...prev, [app._id]: e.target.value }))}
                      />
                      <button
                        className="sa-btn sa-btn-reject"
                        disabled={isBusy}
                        onClick={() => handleReject(app._id)}
                      >
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : approvedSellers.length === 0 ? (
        <div className="sa-empty">No approved sellers yet.</div>
      ) : (
        <div className="sa-list">
          {approvedSellers.map((seller) => {
            const isBusy = busyId === seller._id;
            return (
              <div key={seller._id} className="sa-card sa-card-compact">
                <div className="sa-applicant">
                  {seller.storeLogo && <img src={seller.storeLogo} alt={seller.businessName} className="sa-logo" />}
                  <div>
                    <h3>{seller.businessName}</h3>
                    <p className="sa-applicant-name">
                      {seller.userId?.fullName || seller.userId?.userName} · {seller.userId?.email}
                    </p>
                    <p className="sa-applicant-phone">
                      Approved {seller.approvedAt ? new Date(seller.approvedAt).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>
                </div>
                <button
                  className="sa-btn sa-btn-suspend"
                  disabled={isBusy}
                  onClick={() => handleSuspend(seller._id)}
                >
                  <FiPauseCircle /> Suspend
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellerApplications;
