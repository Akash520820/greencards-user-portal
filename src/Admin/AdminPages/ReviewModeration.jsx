// ReviewModeration.jsx
// Two tabs:
//  - Reported: GET /admin/reviews/reported (visible reviews with reports) — Hide
//  - Hidden: GET /admin/reviews/hidden — Unhide
// The "Hidden" tab exists because unhideReview needs a review _id, and until
// GET /admin/reviews/hidden was added, a review became undiscoverable the
// moment it was hidden (getReportedReviews only ever returns visible ones).
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiEyeOff, FiEye, FiStar, FiFlag } from 'react-icons/fi';
import * as adminApi from '../../api/admin.api';
import './ReviewModeration.css';

const Stars = ({ rating }) => (
  <span className="rm-stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} className={n <= rating ? 'rm-star-filled' : 'rm-star-empty'} />
    ))}
  </span>
);

const ReviewModeration = () => {
  const [tab, setTab] = useState('reported'); // "reported" | "hidden"
  const [reported, setReported] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [hideDrafts, setHideDrafts] = useState({});

  const loadReported = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getReportedReviews();
      setReported(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load reported reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHidden = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getHiddenReviews();
      setHidden(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load hidden reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'reported') loadReported();
    else loadHidden();
  }, [tab, loadReported, loadHidden]);

  const handleHide = async (reviewId) => {
    const reason = (hideDrafts[reviewId] || '').trim();
    if (!reason) {
      toast.error('Please give a reason for hiding this review');
      return;
    }
    setBusyId(reviewId);
    try {
      await adminApi.hideReview(reviewId, reason);
      toast.success('Review hidden');
      loadReported();
    } catch (err) {
      toast.error(err.message || 'Failed to hide review');
    } finally {
      setBusyId(null);
    }
  };

  const handleUnhide = async (reviewId) => {
    setBusyId(reviewId);
    try {
      await adminApi.unhideReview(reviewId);
      toast.success('Review restored');
      loadHidden();
    } catch (err) {
      toast.error(err.message || 'Failed to restore review');
    } finally {
      setBusyId(null);
    }
  };

  const list = tab === 'reported' ? reported : hidden;

  return (
    <div className="review-mod-page">
      <Toaster position="top-center" />
      <div className="rm-header">
        <h1>Review Moderation</h1>
        <div className="rm-tabs">
          <button className={`rm-tab ${tab === 'reported' ? 'active' : ''}`} onClick={() => setTab('reported')}>
            Reported
          </button>
          <button className={`rm-tab ${tab === 'hidden' ? 'active' : ''}`} onClick={() => setTab('hidden')}>
            Hidden
          </button>
        </div>
      </div>

      {error && <p className="rm-error">{error}</p>}

      {loading ? (
        <div className="rm-loading">Loading…</div>
      ) : list.length === 0 ? (
        <div className="rm-empty">
          {tab === 'reported' ? 'No reported reviews right now.' : 'No hidden reviews right now.'}
        </div>
      ) : (
        <div className="rm-list">
          {list.map((review) => {
            const isBusy = busyId === review._id;
            return (
              <div key={review._id} className="rm-card">
                <div className="rm-card-top">
                  <div>
                    <span className="rm-product-name">{review.product?.name}</span>
                    <Stars rating={review.rating} />
                  </div>
                  {tab === 'reported' ? (
                    <span className="rm-report-count">
                      <FiFlag /> {review.reports?.length || 0} report{review.reports?.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="rm-hidden-badge">Hidden</span>
                  )}
                </div>

                <p className="rm-reviewer">by {review.user?.userName} ({review.user?.email})</p>

                {review.comment && <p className="rm-comment">{review.comment}</p>}

                {tab === 'reported' && review.reports?.length > 0 && (
                  <div className="rm-reports">
                    <span className="rm-reports-label">Report reasons:</span>
                    <ul>
                      {review.reports.map((rep, idx) => (
                        <li key={idx}>{rep.reason || 'No reason given'}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {tab === 'hidden' && review.hiddenReason && (
                  <div className="rm-reports">
                    <span className="rm-reports-label">
                      Hidden by {review.hiddenBy?.fullName || review.hiddenBy?.userName || 'an admin'}
                      {review.hiddenAt && ` on ${new Date(review.hiddenAt).toLocaleDateString('en-IN')}`}:
                    </span>
                    <p className="rm-hidden-reason">{review.hiddenReason}</p>
                  </div>
                )}

                {tab === 'reported' ? (
                  <div className="rm-actions">
                    <input
                      type="text"
                      placeholder="Reason for hiding (required)"
                      value={hideDrafts[review._id] || ''}
                      onChange={(e) => setHideDrafts((prev) => ({ ...prev, [review._id]: e.target.value }))}
                    />
                    <button
                      className="rm-btn rm-btn-hide"
                      disabled={isBusy}
                      onClick={() => handleHide(review._id)}
                    >
                      <FiEyeOff /> Hide Review
                    </button>
                  </div>
                ) : (
                  <div className="rm-actions">
                    <button
                      className="rm-btn rm-btn-unhide"
                      disabled={isBusy}
                      onClick={() => handleUnhide(review._id)}
                    >
                      <FiEye /> Restore Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
