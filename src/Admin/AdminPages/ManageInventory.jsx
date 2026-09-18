import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { FiSearch, FiInbox, FiPackage, FiPlus, FiMinus, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import './ManageInventory.css';

const ManageInventory = () => {
  const { products, updateStock, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'All' || 
                        (stockFilter === 'In Stock' && product.inStock) || 
                        (stockFilter === 'Out of Stock' && !product.inStock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const outOfStockProducts = products.filter(p => !p.inStock);
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= 10);

  const handleStockToggle = async (productId, productName, currentStatus) => {
    try {
      // The backend has no boolean "in stock" flag — availability is derived
      // from the numeric stock count. Toggling off zeroes it out; toggling
      // back on restores a starter quantity of 10 (adjust as needed).
      await updateStock(productId, { stock: currentStatus ? 0 : 10 });
      const newStatus = currentStatus ? 'Out of Stock' : 'In Stock';
      toast.success(`${productName} is now ${newStatus}`, {
        icon: currentStatus ? '❌' : '✅',
        duration: 2000,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to update stock status');
    }
  };

  const handleQuantityChange = async (productId, change) => {
    const product = products.find(p => p._id === productId);
    const newQuantity = Math.max(0, (product.stock || 0) + change);
    try {
      await updateStock(productId, { stock: newQuantity });
      if (newQuantity === 0) {
        toast.error(`${product.name} is now out of stock!`, { icon: '⚠️' });
      } else if (newQuantity <= 5) {
        toast(`${product.name} stock is low (${newQuantity} remaining)`, { icon: '⚠️' });
      } else {
        toast.success(`Updated ${product.name} quantity to ${newQuantity}`, { icon: '✅' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const startEditingQuantity = (productId, currentQuantity) => {
    setEditingQuantity(productId);
    setTempQuantity((currentQuantity || 0).toString());
  };

  const saveQuantity = async (productId, productName) => {
    const newQuantity = parseInt(tempQuantity) || 0;
    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }
    try {
      await updateStock(productId, { stock: newQuantity });
      setEditingQuantity(null);
      toast.success(`Updated ${productName} quantity to ${newQuantity}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const cancelEdit = () => {
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleBulkUpdateStock = async () => {
    if (outOfStockProducts.length === 0) {
      toast.error('No out of stock products to update');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to mark all ${outOfStockProducts.length} out-of-stock products as available?`
    );

    if (confirmed) {
      try {
        await Promise.all(outOfStockProducts.map(product => updateStock(product._id, { stock: 10 })));
        toast.success(`✅ ${outOfStockProducts.length} products marked as in stock!`, {
          duration: 3000,
        });
      } catch (err) {
        toast.error(err.message || 'Failed to bulk-update stock');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin-inventory-page">
      <Toaster position="top-center" />
      
      <div className="admin-inventory-header">
        <div>
          <h1 className="admin-inventory-title">
            All Products
            <span className="admin-stats-badge">{filteredProducts.length} Items</span>
            {outOfStockProducts.length > 0 && (
              <span className="admin-out-of-stock-badge">
                {outOfStockProducts.length} Out of Stock
              </span>
            )}
            {lowStockProducts.length > 0 && (
              <span className="admin-low-stock-badge">
                {lowStockProducts.length} Low Stock
              </span>
            )}
          </h1>
          <p className="admin-inventory-subtitle">
            Manage your product inventory, stock status, and quantities
          </p>
        </div>

        {outOfStockProducts.length > 0 && (
          <button 
            className="admin-bulk-update-btn"
            onClick={handleBulkUpdateStock}
          >
            <FiPackage />
            Update All Stock ({outOfStockProducts.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="admin-inventory-filters">
        <div className="admin-search-wrapper">
          <FiSearch className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-category-select"
        >
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="admin-category-select"
        >
          <option value="All">All Stock Status</option>
          <option value="In Stock">In Stock Only</option>
          <option value="Out of Stock">Out of Stock Only</option>
        </select>
      </div>

      {/* Desktop Table View */}
      <div className="admin-inventory-table-container admin-desktop-view">
        <table className="admin-inventory-table">
          <thead>
            <tr>
              <th className="admin-table-header">Product</th>
              <th className="admin-table-header">Seller / Store</th>
              <th className="admin-table-header">Category</th>
              <th className="admin-table-header">Price</th>
              <th className="admin-table-header">Quantity</th>
              <th className="admin-table-header">Status</th>
              <th className="admin-table-header">Available</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product._id} className="admin-table-row">
                  <td className="admin-table-cell admin-product-cell">
                    <div className="admin-product-info">
                      <img 
                        src={product.image[0] || product.image} 
                        alt={product.name}
                        className="admin-product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/70?text=No+Image';
                        }}
                      />
                      <span className="admin-product-name">{product.name}</span>
                    </div>
                  </td>
                  <td className="admin-table-cell">
                    <span 
                      style={{
                        display: 'inline-block',
                        fontSize: '0.8rem',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontWeight: '600'
                      }}
                    >
                      🏪 {product.createdBy?.storeName || product.createdBy?.fullName || product.createdBy?.email || 'SuperAdmin'}
                    </span>
                  </td>
                  <td className="admin-table-cell admin-category-cell">
                    {product.category}
                  </td>
                  <td className="admin-table-cell admin-price-cell">
                    ₹{product.offerPrice || product.price}
                  </td>
                  <td className="admin-table-cell">
                    <div className="admin-quantity-controls">
                      {editingQuantity === product._id ? (
                        <div className="admin-quantity-edit">
                          <input
                            type="number"
                            value={tempQuantity}
                            onChange={(e) => setTempQuantity(e.target.value)}
                            className="admin-quantity-input"
                            min="0"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveQuantity(product._id, product.name);
                              } else if (e.key === 'Escape') {
                                cancelEdit();
                              }
                            }}
                          />
                          <button
                            onClick={() => saveQuantity(product._id, product.name)}
                            className="admin-quantity-btn save"
                            title="Save"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="admin-quantity-btn cancel"
                            title="Cancel"
                          >
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleQuantityChange(product._id, -1)}
                            className="admin-quantity-btn minus"
                            disabled={(product.stock || 0) <= 0}
                          >
                            <FiMinus />
                          </button>
                          <span 
                            className={`admin-quantity-value ${
                              (product.stock || 0) === 0 ? 'zero' : 
                              (product.stock || 0) <= 10 ? 'low' : ''
                            }`}
                            onClick={() => startEditingQuantity(product._id, product.stock)}
                            title="Click to edit"
                          >
                            {product.stock || 0}
                            <FiEdit2 className="admin-edit-icon" />
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product._id, 1)}
                            className="admin-quantity-btn plus"
                          >
                            <FiPlus />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="admin-table-cell">
                    <span className={`admin-stock-status-badge ${
                      (product.stock || 0) === 0 ? 'out-of-stock' :
                      (product.stock || 0) <= 10 ? 'low-stock' :
                      'in-stock'
                    }`}>
                      {(product.stock || 0) === 0 ? 'Out of Stock' :
                       (product.stock || 0) <= 10 ? 'Low Stock' :
                       'Available'}
                    </span>
                  </td>
                  <td className="admin-table-cell">
                    <label className="admin-toggle-switch">
                      <input
                        type="checkbox"
                        checked={product.inStock}
                        onChange={() => handleStockToggle(product._id, product.name, product.inStock)}
                      />
                      <span className="admin-toggle-slider"></span>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="admin-no-products-cell">
                  <div className="admin-no-products-message">
                    <FiInbox size={48} />
                    <p>No products found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="admin-mobile-view">
        {filteredProducts.length > 0 ? (
          <div className="admin-product-cards">
            {filteredProducts.map((product) => (
              <div key={product._id} className="admin-product-card">
                <div className="admin-card-left">
                  <img 
                    src={product.image[0] || product.image} 
                    alt={product.name}
                    className="admin-card-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/70?text=No+Image';
                    }}
                  />
                </div>
                <div className="admin-card-content">
                  <h3 className="admin-card-title">{product.name}</h3>
                  <span className="admin-card-category">{product.category}</span>
                  
                  {/* Mobile Quantity Controls */}
                  <div className="admin-card-quantity-section">
                    <span className="admin-quantity-label">Quantity:</span>
                    <div className="admin-quantity-controls mobile">
                      <button
                        onClick={() => handleQuantityChange(product._id, -1)}
                        className="admin-quantity-btn minus"
                        disabled={(product.stock || 0) <= 0}
                      >
                        <FiMinus />
                      </button>
                      <span className={`admin-quantity-value ${
                        (product.stock || 0) === 0 ? 'zero' : 
                        (product.stock || 0) <= 10 ? 'low' : ''
                      }`}>
                        {product.stock || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(product._id, 1)}
                        className="admin-quantity-btn plus"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>

                  <div className="admin-card-footer">
                    <span className="admin-card-price">
                      ₹{product.offerPrice || product.price}
                    </span>
                    <div className="admin-card-stock">
                      <span className={`admin-stock-label ${
                        (product.stock || 0) === 0 ? 'out-stock' :
                        (product.stock || 0) <= 10 ? 'low-stock' :
                        'in-stock'
                      }`}>
                        {(product.stock || 0) === 0 ? 'Out of Stock' :
                         (product.stock || 0) <= 10 ? 'Low Stock' :
                         'In Stock'}
                      </span>
                      <label className="admin-toggle-switch admin-toggle-small">
                        <input
                          type="checkbox"
                          checked={product.inStock}
                          onChange={() => handleStockToggle(product._id, product.name, product.inStock)}
                        />
                        <span className="admin-toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-no-products-mobile">
            <FiInbox size={48} />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageInventory;