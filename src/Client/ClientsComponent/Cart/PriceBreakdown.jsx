// PriceBreakdown.jsx - Memoized Price Display Component with Coupon Support
import React, { memo, useState } from 'react';
import { validateCoupon } from '../../../api/coupons.api';
import toast from 'react-hot-toast';

const PriceBreakdown = memo(({ subtotal, tax, total, appliedCoupon, onApplyCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoading(true);
    try {
      const res = await validateCoupon({ code: couponCode.trim(), cartAmount: subtotal });
      onApplyCoupon(res.data);
      toast.success(`Coupon "${res.data.code}" applied! Saved ₹${res.data.discountAmount}`);
    } catch (err) {
      toast.error(err.message || 'Invalid or expired coupon code');
    } finally {
      setLoading(false);
    }
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <>
      <div className="cart-summary-row">
        <span>Subtotal</span> 
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      
      <div className="cart-summary-row">
        <span>Shipping Fee</span>
        <span className="cart-summary-free">FREE</span>
      </div>
      
      <div className="cart-summary-row">
        <span>Tax (2%)</span>
        <span>₹{tax.toFixed(2)}</span>
      </div>

      {appliedCoupon && (
        <div className="cart-summary-row" style={{ color: '#16a34a', fontWeight: 600 }}>
          <span>Discount ({appliedCoupon.code})</span>
          <span>-₹{discountAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Coupon Apply Form */}
      <div style={{ marginTop: '12px', marginBottom: '12px' }}>
        {!appliedCoupon ? (
          <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                textTransform: 'uppercase',
              }}
            />
            <button
              type="submit"
              disabled={loading || !couponCode.trim()}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {loading ? '...' : 'Apply'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px' }}>
            <span style={{ color: '#15803d', fontWeight: 600 }}>✓ Coupon Applied</span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
      
      <div className="cart-summary-divider"></div>
      
      <div className="cart-summary-row cart-summary-total">
        <span>Total Amount:</span>
        <span>₹{finalTotal.toFixed(2)}</span>
      </div>
    </>
  );
});

PriceBreakdown.displayName = 'PriceBreakdown';

export default PriceBreakdown;