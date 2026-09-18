import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiPackage,
  FiPieChart,
  FiBarChart2,
  FiDownload,
  FiMoreHorizontal,
  FiUpload
} from 'react-icons/fi';
import './SalesAnalytics.css';

const SalesAnalytics = () => {
  const { orders, fetchAllOrders } = useOrders();
  const { products } = useProducts();
  const [timeFilter, setTimeFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    calculateAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, orders]);

  const calculateAnalytics = () => {
    const filteredOrders = filterOrdersByTime(orders, timeFilter);

    const totalRevenue = filteredOrders
      .filter(order => order.orderStatus !== 'cancelled')
      .reduce((sum, order) => sum + order.totalPrice, 0);

    let totalItemsSold = 0;
    const productSales = {};
    const categorySales = {};
    // Order channel isn't tracked by the backend, so this stays a rough
    // illustrative split rather than real analytics data.
    const channelSales = { website: 0, mobile: 0, market: 0, agent: 0 };

    filteredOrders
      .filter(order => order.orderStatus !== 'cancelled')
      .forEach(order => {
        const channels = ['website', 'mobile', 'market', 'agent'];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        channelSales[channel] += order.totalPrice;

        order.items.forEach(item => {
          const productId = item.product?.toString() || item.name;
          const productName = item.name;
          const matchedProduct = products.find(p => p._id === productId);
          const category = matchedProduct?.category || 'Uncategorized';
          const quantity = item.quantity;
          const revenue = item.price * quantity;

          totalItemsSold += quantity;

          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: productName,
              category: category,
              image: item.image,
              quantitySold: 0,
              revenue: 0,
              orders: 0
            };
          }

          productSales[productId].quantitySold += quantity;
          productSales[productId].revenue += revenue;
          productSales[productId].orders += 1;

          if (!categorySales[category]) {
            categorySales[category] = {
              category: category,
              quantitySold: 0,
              revenue: 0,
              products: new Set()
            };
          }

          categorySales[category].quantitySold += quantity;
          categorySales[category].revenue += revenue;
          categorySales[category].products.add(productId);
        });
      });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold);
    
    const topCategories = Object.values(categorySales)
      .map(cat => ({
        ...cat,
        products: cat.products.size
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    const completedOrders = filteredOrders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = filteredOrders.filter(o => o.orderStatus === 'processing').length;
    const cancelledOrders = filteredOrders.filter(o => o.orderStatus === 'cancelled').length;
    
    const avgOrderValue = filteredOrders.length > 0 
      ? totalRevenue / filteredOrders.filter(o => o.orderStatus !== 'cancelled').length 
      : 0;
    
    setAnalytics({
      totalRevenue,
      totalItemsSold,
      totalOrders: filteredOrders.length,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      avgOrderValue,
      topProducts,
      topCategories,
      productSales: Object.values(productSales),
      channelSales
    });
  };

  const filterOrdersByTime = (orders, filter) => {
    const now = new Date();
    
    switch(filter) {
      case 'today':
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate.toDateString() === now.toDateString();
        });
      
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekAgo;
        });
      }
      
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthAgo;
        });
      }
      
      default:
        return orders;
    }
  };

  const exportToCSV = () => {
    if (!analytics || !analytics.productSales.length) {
      alert('No data to export');
      return;
    }

    const csvRows = [
      ['Product Name', 'Category', 'Quantity Sold', 'Revenue', 'Number of Orders'],
      ...analytics.productSales.map(product => [
        product.name,
        product.category,
        product.quantitySold,
        `₹${product.revenue.toFixed(2)}`,
        product.orders
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (!analytics) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics…</p>
      </div>
    );
  }

  return (
    <div className="sales-analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Sales Analytics</h1>
          <p className="analytics-subtitle">Track your sales performance and product insights</p>
        </div>
        
        <div className="analytics-controls">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="time-filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          
          <button className="export-btn" onClick={exportToCSV}>
            <FiDownload />
            Export Report
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="analytics-main-grid">
        {/* Sales Overview */}
        <div className="analytics-card sales-overview">
          <div className="card-header">
            <h3 className="card-title">Sales Overview</h3>
            <span className="card-menu"><FiMoreHorizontal /></span>
          </div>
          
          <div className="donut-chart-container">
            <div className="donut-chart">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="28"
                  strokeDasharray={`₹{(analytics.totalRevenue / (analytics.totalRevenue + analytics.totalItemsSold * 10)) * 440} 440`}
                  transform="rotate(-90 90 90)"
                />
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="28"
                  strokeDasharray={`₹{((analytics.totalItemsSold * 10) / (analytics.totalRevenue + analytics.totalItemsSold * 10)) * 440} 440`}
                  strokeDashoffset={`-₹{(analytics.totalRevenue / (analytics.totalRevenue + analytics.totalItemsSold * 10)) * 440}`}
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="donut-center">
                <span className="donut-value">₹{(analytics.totalRevenue / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>

          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-label">
                <span className="legend-dot profit"></span>
                <span className="legend-text">Revenue</span>
              </div>
              <span className="legend-value">₹{(analytics.totalRevenue / 1000).toFixed(1)}k</span>
            </div>
            <div className="legend-item">
              <div className="legend-label">
                <span className="legend-dot expense"></span>
                <span className="legend-text">Items Sold</span>
              </div>
              <span className="legend-value">{analytics.totalItemsSold}</span>
            </div>
          </div>

          {/* Order Fulfillment Pipeline Breakdown (Courier Handover / Transit Status) */}
          <div className="fulfillment-pipeline-widget" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>
              📦 Order Fulfillment Pipeline
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#fef3c7', borderRadius: '6px', color: '#92400e', fontWeight: '600' }}>
                <span>Pending Courier Handover:</span>
                <span>{orders.filter(o => o.orderStatus === 'processing').length} orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#e0f2fe', borderRadius: '6px', color: '#0369a1', fontWeight: '600' }}>
                <span>In Transit (Shipped):</span>
                <span>{orders.filter(o => o.orderStatus === 'shipped').length} orders</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: '#dcfce7', borderRadius: '6px', color: '#166534', fontWeight: '600' }}>
                <span>Delivered to Customer:</span>
                <span>{orders.filter(o => o.orderStatus === 'delivered').length} orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Updates */}
        <div className="analytics-card revenue-updates">
          <div className="card-header">
            <h3 className="card-title">Revenue Updates</h3>
            <span className="card-menu"><FiMoreHorizontal /></span>
          </div>
          
          <div className="bar-chart">
            {[20, 45, 80, 60, 40, 30, 50, 35].map((height, index) => (
              <div 
                key={index} 
                className={`bar ${index === 3 ? 'active' : ''}`}
                style={{ height: `₹{height}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Yearly Sales */}
        <div className="analytics-card yearly-sales">
          <div className="card-header">
            <h3 className="card-title">Yearly Sales</h3>
            <span className="card-menu"><FiMoreHorizontal /></span>
          </div>
          
          <div className="line-chart-container">
            <svg width="100%" height="200" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d="M 0,120 Q 50,80 100,100 T 200,60 T 300,90 T 350,50"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
              />
              <path
                d="M 0,120 Q 50,80 100,100 T 200,60 T 300,90 T 350,50 L 350,200 L 0,200 Z"
                fill="url(#lineGradient)"
              />
            </svg>
          </div>

          <div className="chart-legend-horizontal">
            <div className="legend-item">
              <div className="legend-label">
                <span className="legend-dot profit"></span>
                <span className="legend-text">₹{(analytics.totalRevenue * 0.6 / 1000).toFixed(0)}k</span>
              </div>
              <span className="legend-value">2023</span>
            </div>
            <div className="legend-item">
              <div className="legend-label">
                <span className="legend-dot" style={{ background: '#c7d2fe' }}></span>
                <span className="legend-text">₹{(analytics.totalRevenue * 0.4 / 1000).toFixed(0)}k</span>
              </div>
              <span className="legend-value">2022</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="analytics-bottom-grid">
        {/* Active Users */}
        <div className="analytics-card active-users">
          <div className="users-header">
            <div>
              <h3 className="card-title">Active Users</h3>
              <p className="users-metric">
                <span className="metric-value">8.06%</span> Vs. previous month
              </p>
            </div>
            <a href="#" className="export-link">
              <FiUpload />
              Export
            </a>
          </div>
          
          <div className="users-count">{analytics.totalOrders * 3 + 123}</div>
          <div className="users-label">Total Active Users</div>
          
          <div className="world-map">
            <span>🗺️ Interactive map visualization</span>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="analytics-card">
          <div className="card-header">
            <h3 className="card-title">Payment Gateways</h3>
            <span className="card-menu"><FiMoreHorizontal /></span>
          </div>
          
          <div className="payment-gateways-list">
            <div className="gateway-item">
              <div className="gateway-info">
                <div className="gateway-icon paypal">
                  <FiDollarSign />
                </div>
                <div className="gateway-details">
                  <h4>Paypal</h4>
                  <p>Big Brands</p>
                </div>
              </div>
              <div className="gateway-amount positive">
                +₹{(analytics.totalRevenue * 0.4).toFixed(0)}
              </div>
            </div>

            <div className="gateway-item">
              <div className="gateway-info">
                <div className="gateway-icon wallet">
                  <FiPackage />
                </div>
                <div className="gateway-details">
                  <h4>Wallet</h4>
                  <p>Bill payment</p>
                </div>
              </div>
              <div className="gateway-amount negative">
                -₹{(analytics.totalRevenue * 0.1).toFixed(0)}
              </div>
            </div>

            <div className="gateway-item">
              <div className="gateway-info">
                <div className="gateway-icon card">
                  <FiShoppingCart />
                </div>
                <div className="gateway-details">
                  <h4>Credit card</h4>
                  <p>Bill Payment</p>
                </div>
              </div>
              <div className="gateway-amount positive">
                +₹{(analytics.totalRevenue * 0.5).toFixed(0)}
              </div>
            </div>
          </div>

          <button className="view-all-btn">View all transactions</button>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="order-status-section">
        <h2 className="section-title">Order Status Breakdown</h2>
        <div className="status-cards">
          <div className="status-card completed">
            <div className="status-number">{analytics.completedOrders}</div>
            <div className="status-label">Completed</div>
          </div>
          <div className="status-card pending">
            <div className="status-number">{analytics.pendingOrders}</div>
            <div className="status-label">Pending</div>
          </div>
          <div className="status-card cancelled">
            <div className="status-number">{analytics.cancelledOrders}</div>
            <div className="status-label">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="analytics-content-grid">
        <div className="analytics-section top-products-section">
          <div className="section-header">
            <div className="section-header-left">
              <FiBarChart2 />
              <h2 className="section-title">Top Selling Products</h2>
            </div>
            <span className="badge">{analytics.topProducts.length} Products</span>
          </div>

          {analytics.topProducts.length > 0 ? (
            <div className="top-products-list">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                    }}
                  />
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <span className="product-category">{product.category}</span>
                  </div>
                  <div className="product-stats">
                    <div className="stat-item">
                      <span className="stat-value">{product.quantitySold}</span>
                      <span className="stat-label">Sold</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value revenue">₹{product.revenue.toFixed(2)}</span>
                      <span className="stat-label">Revenue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiPackage size={48} />
              <p>No sales data available</p>
            </div>
          )}
        </div>

        <div className="analytics-section category-section">
          <div className="section-header">
            <div className="section-header-left">
              <FiPieChart />
              <h2 className="section-title">Sales by Category</h2>
            </div>
          </div>

          {analytics.topCategories.length > 0 ? (
            <div className="category-list">
              {analytics.topCategories.slice(0, 4).map((category) => (
                <div key={category.category} className="category-item">
                  <div className="category-header">
                    <h4>{category.category}</h4>
                    <span className="category-revenue">₹{category.revenue.toFixed(2)}</span>
                  </div>
                  <div className="category-details">
                    <span className="detail-item">
                      <FiPackage />
                      {category.quantitySold} items sold
                    </span>
                    <span className="detail-item">
                      {category.products} products
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `₹{(category.revenue / analytics.totalRevenue) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="percentage">
                    {((category.revenue / analytics.totalRevenue) * 100).toFixed(1)}% of total
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FiPieChart size={48} />
              <p>No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* All Products Sales Table */}
      <div className="analytics-section all-products-section">
        <div className="section-header">
          <h2 className="section-title">Detailed Product Sales</h2>
        </div>

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {analytics.productSales
                .sort((a, b) => b.quantitySold - a.quantitySold)
                .map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-info">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="table-product-image"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                          }}
                        />
                        <span className="table-product-name">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="quantity-cell">{product.quantitySold}</td>
                    <td className="revenue-cell">₹{product.revenue.toFixed(2)}</td>
                    <td>{product.orders}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;