// SellerOrders.jsx
// Read-only by design: GET /seller/orders returns orders trimmed down to just
// this seller's own line items (seller.controller.js:getSellerOrders).
// Changing an order's status is admin-only (order.routes.js — PATCH
// /orders/admin/:orderId/status requires verifyAdmin), so there's no status
// control here — a seller can see their orders but not change them.
import React, { useState, useEffect, useCallback } from 'react';
import * as sellerApi from '../../api/seller.api';
import './SellerOrders.css';

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  processing: '#f0ad4e',
  shipped: '#3182ce',
  delivered: '#2f855a',
  cancelled: '#e53e3e',
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerApi.getSellerOrders({ page, limit: PAGE_SIZE });
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  const sellerSubtotal = (order) =>
    order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="seller-orders-page">
      <div className="so-header">
        <h1>Orders</h1>
        <p>{pagination.total} order{pagination.total !== 1 ? 's' : ''} containing your products</p>
      </div>

      {error && <p className="so-error">{error}</p>}

      {loading ? (
        <div className="so-loading">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="so-empty">No orders yet for your products.</div>
      ) : (
        <>
          <div className="so-list">
            {orders.map((order) => (
              <div key={order._id} className="so-card">
                <button
                  className="so-card-header"
                  onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                >
                  <div>
                    <span className="so-order-id">#{order._id.slice(-8)}</span>
                    <span className="so-order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="so-card-header-right">
                    <span
                      className="so-status-badge"
                      style={{ color: STATUS_COLORS[order.orderStatus], borderColor: STATUS_COLORS[order.orderStatus] }}
                    >
                      {order.orderStatus}
                    </span>
                    <span className="so-subtotal">₹{sellerSubtotal(order).toLocaleString('en-IN')}</span>
                  </div>
                </button>

                {expandedId === order._id && (
                  <div className="so-card-body">
                    <div className="so-customer">
                      <strong>Customer:</strong> {order.user?.fullName || order.user?.userName} (
                      {order.user?.email})
                    </div>
                    <div className="so-shipping">
                      <strong>Ship to:</strong> {order.shippingAddress?.fullName},{' '}
                      {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{' '}
                      {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                    </div>
                    <div className="so-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="so-item-row">
                          <img src={item.image} alt={item.name} className="so-item-thumb" />
                          <div className="so-item-info">
                            <span className="so-item-name">{item.name}</span>
                            {(item.variant?.color || item.variant?.size) && (
                              <span className="so-item-variant">
                                {[item.variant?.color, item.variant?.size].filter(Boolean).join(' / ')}
                              </span>
                            )}
                          </div>
                          <span className="so-item-qty">×{item.quantity}</span>
                          <span className="so-item-price">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="so-payment" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <div>
                        <span>Payment: {order.paymentMethod.toUpperCase()} | Status: {order.paymentStatus}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600 }}>Update Status:</label>
                        <select
                          value={order.items[0]?.itemStatus || order.orderStatus}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await sellerApi.updateSellerOrderItemStatus(order._id, newStatus);
                              loadOrders(pagination.page);
                            } catch (err) {
                              alert(err.message || 'Failed to update status');
                            }
                          }}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="so-pagination">
              <button disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadOrders(pagination.page + 1)}
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

export default SellerOrders;
