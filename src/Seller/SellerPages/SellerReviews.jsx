// SellerReviews.jsx
// GET /seller/reviews returns visible reviews on this seller's own products
// (seller.controller.js:getMyProductReviews). Replying uses POST
// /seller/reviews/:reviewId/respond, which the backend rejects with a 403 if
// the review isn't on a product this seller created — even though reviewId
// alone doesn't reveal that up front, so errors from a stale list are handled
// gracefully rather than assumed impossible.
import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import * as sellerApi from '../../api/seller.api';
import './SellerReviews.css';

const PAGE_SIZE = 10;

const Stars = ({ rating }) => (
  <span className="sr-stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <FiStar key={n} className={n <= rating ? 'sr-star-filled' : 'sr-star-empty'} />
    ))}
  </span>
);

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const loadReviews = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerApi.getMyProductReviews({ page, limit: PAGE_SIZE });
      setReviews(res.data.reviews);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const handleReply = async (reviewId) => {
    const comment = (replyDrafts[reviewId] || '').trim();
    if (!comment) {
      toast.error('Write a reply first');
      return;
    }
    setSubmittingId(reviewId);
    try {
      const res = await sellerApi.respondToReview(reviewId, comment);
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, sellerResponses: res.data.sellerResponses } : r)));
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
      toast.success('Reply posted');
    } catch (err) {
      toast.error(err.message || 'Failed to post reply');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteReply = async (reviewId, responseId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      const res = await sellerApi.deleteReviewResponse(reviewId, responseId);
      setReviews((prev) => prev.map((r) => (r._id === reviewId ? { ...r, sellerResponses: res.data.sellerResponses } : r)));
      toast.success('Reply deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete reply');
    }
  };

  return (
    <div className="seller-reviews-page">
      <Toaster position="top-center" />
      <div className="sr-header">
        <h1>Reviews</h1>
        <p>{pagination.total} review{pagination.total !== 1 ? 's' : ''} on your products</p>
      </div>

      {error && <p className="sr-error">{error}</p>}

      {loading ? (
        <div className="sr-loading">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="sr-empty">No reviews on your products yet.</div>
      ) : (
        <>
          <div className="sr-list">
            {reviews.map((review) => (
              <div key={review._id} className="sr-card">
                <div className="sr-card-top">
                  <div>
                    <span className="sr-product-name">{review.product?.name}</span>
                    <Stars rating={review.rating} />
                  </div>
                  <span className="sr-reviewer">by {review.user?.userName}</span>
                </div>

                {review.comment && <p className="sr-comment">{review.comment}</p>}

                {review.images?.length > 0 && (
                  <div className="sr-review-images">
                    {review.images.map((url, idx) => (
                      <img key={idx} src={url} alt={`Review ${idx + 1}`} />
                    ))}
                  </div>
                )}

                {review.sellerResponses?.length > 0 && (
                  <div className="sr-responses">
                    {review.sellerResponses.map((resp) => (
                      <div key={resp._id} className="sr-response">
                        <div className="sr-response-header">
                          <span>Your reply</span>
                          <button
                            className="sr-delete-reply-btn"
                            onClick={() => handleDeleteReply(review._id, resp._id)}
                            title="Delete reply"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <p>{resp.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="sr-reply-form">
                  <input
                    type="text"
                    placeholder="Write a reply…"
                    value={replyDrafts[review._id] || ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [review._id]: e.target.value }))}
                  />
                  <button
                    onClick={() => handleReply(review._id)}
                    disabled={submittingId === review._id}
                  >
                    {submittingId === review._id ? 'Posting…' : 'Reply'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="sr-pagination">
              <button disabled={pagination.page <= 1} onClick={() => loadReviews(pagination.page - 1)}>
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadReviews(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellerReviews;
