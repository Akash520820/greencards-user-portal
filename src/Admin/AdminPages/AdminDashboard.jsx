import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import {
  FiPackage,
  FiShoppingCart,
  FiClock,
  FiDollarSign,
  FiPlusCircle,
  FiClipboard,
  FiBox,
  FiArrowRight,
  FiAlertTriangle,
  FiInfo,
  FiTrendingUp,
  FiBarChart2,
  FiPieChart
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuth();
  const { getSellerStats } = useProducts();
  const { orders, fetchAllOrders } = useOrders();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    outOfStock: 0,
    inStock: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    topProducts: [],
    totalItemsSold: 0,
    avgOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computeDashboardData = useCallback(() => {
    setLoading(true);
    try {
      const productStats = getSellerStats();

      const activeOrders = orders.filter((o) => o.orderStatus !== 'cancelled');
      const pendingOrders = orders.filter((o) => o.orderStatus === 'processing').length;
      const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      const productSales = {};
      let totalItemsSold = 0;

      activeOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = item.product?.toString() || item.name;
          totalItemsSold += item.quantity;

          if (!productSales[key]) {
            productSales[key] = {
              id: key,
              name: item.name,
              image: item.image,
              quantitySold: 0,
              revenue: 0
            };
          }
          productSales[key].quantitySold += item.quantity;
          productSales[key].revenue += (item.price || 0) * item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 3);

      const avgOrderValue = activeOrders.length > 0
        ? activeOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) / activeOrders.length
        : 0;

      const recent = orders.slice(0, 5).map((order) => ({
        _id: order._id,
        customerName: order.shippingAddress?.fullName || order.user?.userName || 'Customer',
        productName: order.items.length === 1
          ? order.items[0].name
          : `${order.items.length} items`,
        amount: order.totalPrice,
        status: order.orderStatus,
        date: new Date(order.createdAt).toLocaleDateString('en-GB')
      }));

      setStats({
        totalProducts: productStats.totalProducts,
        inStock: productStats.inStock,
        outOfStock: productStats.outOfStock,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue
      });

      setAnalytics({ topProducts, totalItemsSold, avgOrderValue });
      setRecentOrders(recent);
    } catch (error) {
      console.error('Error computing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [orders, getSellerStats]);

  useEffect(() => {
    computeDashboardData();
  }, [computeDashboardData]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="welcome-card">
        <div className="welcome-card-content">
          <h1 className="dashboard-title">
            Welcome back, {admin?.fullName || admin?.userName || 'Admin'}!
            <span className="welcome-emoji">👋</span>
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your store today
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div 
          className="stat-card stat-card-primary"
          onClick={() => navigate('/admin/inventory')}
          style={{ cursor: 'pointer' }}
          title="Click to view Inventory"
        >
          <div className="stat-icon"><FiPackage /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalProducts}</h3>
            <p className="stat-label">Total Products</p>
          </div>
        </div>

        <div 
          className="stat-card stat-card-success"
          onClick={() => navigate('/admin/orders')}
          style={{ cursor: 'pointer' }}
          title="Click to view All Orders"
        >
          <div className="stat-icon"><FiShoppingCart /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalOrders}</h3>
            <p className="stat-label">Total Orders</p>
          </div>
        </div>

        <div 
          className="stat-card stat-card-warning"
          onClick={() => navigate('/admin/orders')}
          style={{ cursor: 'pointer' }}
          title="Click to view Pending Orders"
        >
          <div className="stat-icon"><FiClock /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.pendingOrders}</h3>
            <p className="stat-label">Pending Orders</p>
          </div>
        </div>

        <div 
          className="stat-card stat-card-info"
          onClick={() => navigate('/admin/analytics')}
          style={{ cursor: 'pointer' }}
          title="Click to view Sales Analytics"
        >
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-content">
            <h3 className="stat-value">₹{stats.totalRevenue.toLocaleString()}</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>
      </div>

      {analytics.topProducts.length > 0 && (
        <div className="analytics-overview-section">
          <div className="section-header">
            <div className="section-header-left">
              <FiBarChart2 className="section-icon" />
              <h2 className="section-title">Sales Overview</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate('/admin/analytics')}>
              Full Analytics <FiArrowRight />
            </button>
          </div>

          <div className="analytics-quick-stats">
            <div className="analytics-quick-card">
              <div className="analytics-quick-icon items-sold"><FiPackage /></div>
              <div className="analytics-quick-content">
                <h4 className="analytics-quick-value">{analytics.totalItemsSold}</h4>
                <p className="analytics-quick-label">Items Sold</p>
              </div>
            </div>

            <div className="analytics-quick-card">
              <div className="analytics-quick-icon avg-order"><FiTrendingUp /></div>
              <div className="analytics-quick-content">
                <h4 className="analytics-quick-value">₹{analytics.avgOrderValue.toFixed(2)}</h4>
                <p className="analytics-quick-label">Avg Order Value</p>
              </div>
            </div>
          </div>

          <div className="top-products-preview">
            <h3 className="subsection-title">
              <FiPieChart /> Top Selling Products
            </h3>
            <div className="top-products-grid">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="top-product-card">
                  <div className="top-product-rank">#{index + 1}</div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="top-product-image"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=No+Image'; }}
                  />
                  <div className="top-product-info">
                    <h4 className="top-product-name">{product.name}</h4>
                    <div className="top-product-stats-inline">
                      <span className="top-product-stat">
                        <strong>{product.quantitySold}</strong> sold
                      </span>
                      <span className="top-product-revenue">
                        ₹{product.revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-card" onClick={() => navigate('/admin/add-product')}>
            <div className="quick-action-icon"><FiPlusCircle /></div>
            <div>
              <h3 className="quick-action-title">Add Product</h3>
              <p className="quick-action-desc">Add new products to your inventory</p>
            </div>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/admin/inventory')}>
            <div className="quick-action-icon"><FiClipboard /></div>
            <div>
              <h3 className="quick-action-title">Manage Inventory</h3>
              <p className="quick-action-desc">Update stock and product details</p>
            </div>
          </button>

          <button className="quick-action-card" onClick={() => navigate('/admin/orders')}>
            <div className="quick-action-icon"><FiBox /></div>
            <div>
              <h3 className="quick-action-title">View Orders</h3>
              <p className="quick-action-desc">Process and manage customer orders</p>
            </div>
          </button>
        </div>
      </div>

      {recentOrders.length > 0 && (
        <div className="recent-orders-section">
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
            <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
              View All <FiArrowRight />
            </button>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="customer-cell">{order.customerName}</td>
                    <td className="product-cell">{order.productName}</td>
                    <td className="amount-cell">₹{order.amount.toFixed(2)}</td>
                    <td className="status-cell">
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="date-cell">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mobile-orders-list">
            {recentOrders.map(order => (
              <div key={order._id} className="mobile-order-card">
                <div className="mobile-order-header">
                  <div>
                    <h3 className="mobile-order-customer">{order.customerName}</h3>
                    <p className="mobile-order-date">{order.date}</p>
                  </div>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="mobile-order-body">
                  <div className="mobile-order-row">
                    <span className="mobile-order-label">Product</span>
                    <span className="mobile-order-value">{order.productName}</span>
                  </div>
                  <div className="mobile-order-row">
                    <span className="mobile-order-label">Amount</span>
                    <span className="mobile-order-amount">₹{order.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.outOfStock > 0 && (
        <div className="alert-banner">
          <FiAlertTriangle />
          <span>
            {stats.outOfStock} product{stats.outOfStock > 1 ? 's are' : ' is'} out of stock.
          </span>
          <button className="alert-action" onClick={() => navigate('/admin/inventory')}>
            Update Stock
          </button>
        </div>
      )}

      {recentOrders.length === 0 && (
        <div className="alert-banner" style={{ background: 'linear-gradient(195deg, #e3f2fd, #bbdefb)', borderColor: '#2196F3' }}>
          <FiInfo style={{ color: '#1976d2' }} />
          <span style={{ color: '#0d47a1' }}>
            No orders yet. Start by adding products to your inventory!
          </span>
          <button
            className="alert-action"
            style={{ background: '#2196F3', color: 'white' }}
            onClick={() => navigate('/admin/add-product')}
          >
            Add Products
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
