// SellerDashboard.jsx
// A real, correctly-scoped seller dashboard: it only ever calls /seller/me
// and /seller/analytics, both of which the backend scopes to the logged-in
// seller's own data (seller.controller.js).
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSellerAuth } from '../../context/SellerAuthContext';
import * as sellerApi from '../../api/seller.api';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { seller } = useSellerAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, statsRes] = await Promise.all([
          sellerApi.getMySellerProfile(),
          sellerApi.getSellerAnalytics(),
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load your dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="seller-dashboard-loading">Loading your dashboard…</div>;
  }

  return (
    <div className="seller-dashboard">
      <h1>Welcome, {seller?.fullName || seller?.userName}</h1>
      {profile && <p className="seller-dashboard-subtitle">{profile.businessName}</p>}

      {error && <p className="seller-dashboard-error">{error}</p>}

      {stats && (
        <div className="seller-stat-grid">
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Products</span>
            <span className="seller-stat-value">{stats.totalProducts}</span>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Total Revenue</span>
            <span className="seller-stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="seller-stat-card">
            <span className="seller-stat-label">Units Sold</span>
            <span className="seller-stat-value">{stats.totalUnitsSold}</span>
          </div>
        </div>
      )}

      <div className="seller-dashboard-quicklinks">
        <Link to="/seller/products" className="seller-quicklink">📦 Manage Products</Link>
        <Link to="/seller/orders" className="seller-quicklink">🧾 View Orders</Link>
        <Link to="/seller/reviews" className="seller-quicklink">⭐ Respond to Reviews</Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
