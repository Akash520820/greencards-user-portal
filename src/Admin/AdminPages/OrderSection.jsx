import React, { useState, useEffect, useCallback } from 'react';
import { useOrders } from '../../context/OrderContext';
import toast, { Toaster } from 'react-hot-toast';
import './OrderSection.css';

// Backend orderStatus enum is lowercase: processing | shipped | delivered | cancelled
const STATUS_TABS = ['All', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];

const OrderSection = () => {
  const { orders, fetchAllOrders, updateOrderStatus, loading } = useOrders();
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  const loadOrders = useCallback(() => {
    fetchAllOrders(statusFilter === 'All' ? {} : { status: statusFilter });
  }, [statusFilter, fetchAllOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-order-section-page">
      <Toaster position="top-center" />

      <div className="admin-orders-header">
        <h1 className="admin-orders-title">Orders</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="admin-orders-subtitle">{sortedOrders.length} orders</p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Sort by:</span>
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '2px solid #4CAF50',
                borderRadius: '8px',
                background: 'white',
                color: '#4CAF50',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <i className={`bi bi-sort-${sortOrder === 'newest' ? 'down' : 'up'}`}></i>
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-status-filter-tabs">
        {STATUS_TABS.map((status) => (
          <button
            key={status}
            className={`admin-status-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'All' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-orders-list">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-card-header">
                <div className="admin-order-id-section">
                  <h3 className="admin-order-id">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <span className={`admin-order-status-badge ${order.orderStatus}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <p className="admin-order-date">
                  Placed on: {formatDateTime(order.createdAt)}
                </p>
              </div>

              <div className="admin-order-card-body">
                <div className="admin-order-products-list">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="admin-product-item">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="admin-product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                        }}
                      />
                      <div className="admin-product-info">
                        <h4>{item.name}</h4>
                        <p className="admin-product-quantity">
                          Qty: <span className="quantity-value">{item.quantity}</span>
                        </p>
                        <span 
                          className="admin-seller-badge"
                          style={{
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            marginTop: '4px'
                          }}
                        >
                          🏪 Store: {item.seller?.storeName || item.seller?.fullName || item.seller?.email || 'SuperAdmin'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="admin-product-item">
                      <div className="admin-multiple-products-icon">
                        <i className="bi bi-plus"></i>
                      </div>
                      <div className="admin-product-info">
                        <h4>+{order.items.length - 2} more items</h4>
                      </div>
                    </div>
                  )}
                </div>

                <div className="admin-order-details-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Total Amount</span>
                    <span className="admin-detail-value total-amount">
                      ₹{order.totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Payment Method</span>
                    <span className="admin-detail-value">
                      {order.paymentMethod.toUpperCase()}
                    </span>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Items</span>
                    <span className="admin-detail-value">{order.items.length}</span>
                  </div>

                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Payment Status</span>
                    <span className="admin-detail-value">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="admin-customer-info-section">
                  <h4 className="admin-customer-name">{order.shippingAddress?.fullName}</h4>
                  <p className="admin-customer-detail">
                    <i className="bi bi-geo-alt-fill"></i>
                    {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                  <p className="admin-customer-detail">
                    <i className="bi bi-telephone-fill"></i>
                    {order.shippingAddress?.phone}
                  </p>
                </div>

                <div className="admin-status-update-section">
                  <span className="admin-status-update-label">Update Order Status:</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="admin-status-select"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-order-card-actions">
                {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                  <button
                    className="admin-action-btn cancel-order"
                    onClick={() => handleStatusChange(order._id, 'cancelled')}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="admin-no-orders">
            <i className="bi bi-inbox"></i>
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSection;
