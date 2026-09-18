// SellerProducts.jsx
// Lists only the products this seller created (GET /seller/products — scoped
// server-side by seller.controller.js:getMyProducts). Create/update/delete use
// the shared /products endpoints, which the backend also scopes: a seller can
// only mutate a product where product.createdBy === themselves
// (product.controller.js enforces this even though the route is shared with admins).
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import * as sellerApi from '../../api/seller.api';
import * as productsApi from '../../api/products.api';
import './SellerProducts.css';

const PAGE_SIZE = 10;

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await sellerApi.getMyProducts({ page, limit: PAGE_SIZE });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load your products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const handleToggleActive = async (product) => {
    try {
      const formData = new FormData();
      formData.append('isActive', String(!product.isActive));
      await productsApi.updateProduct(product._id, formData);
      toast.success(product.isActive ? 'Product hidden from store' : 'Product made active');
      loadProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeletingId(product._id);
    try {
      await productsApi.deleteProduct(product._id);
      toast.success('Product deleted');
      loadProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="seller-products-page">
      <Toaster position="top-center" />
      <div className="sp-header">
        <div>
          <h1>My Products</h1>
          <p>{pagination.total} product{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/seller/products/new" className="sp-add-btn">
          <FiPlus /> Add Product
        </Link>
      </div>

      {error && <p className="sp-error">{error}</p>}

      {loading ? (
        <div className="sp-loading">Loading your products…</div>
      ) : products.length === 0 ? (
        <div className="sp-empty">
          <p>You haven't listed any products yet.</p>
          <Link to="/seller/products/new" className="sp-add-btn">
            <FiPlus /> Add your first product
          </Link>
        </div>
      ) : (
        <>
          <div className="sp-table-wrapper">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const hasVariants = p.colorVariants && p.colorVariants.length > 0;
                  const totalStock = hasVariants
                    ? p.colorVariants.reduce(
                        (sum, cv) => sum + cv.sizes.reduce((s, sz) => s + (sz.stock || 0), 0),
                        0
                      )
                    : p.stock;

                  return (
                    <tr key={p._id}>
                      <td className="sp-product-cell">
                        <img src={p.images?.[0]} alt={p.name} className="sp-thumb" />
                        <span>{p.name}</span>
                      </td>
                      <td>{p.category?.name || '—'}</td>
                      <td>
                        {p.discountPrice > 0 ? (
                          <>
                            <span className="sp-price-discount">₹{p.discountPrice}</span>{' '}
                            <span className="sp-price-strike">₹{p.price}</span>
                          </>
                        ) : (
                          <>₹{p.price}</>
                        )}
                      </td>
                      <td>{totalStock}</td>
                      <td>
                        <span className={`sp-status-badge ${p.isActive ? 'active' : 'inactive'}`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="sp-actions-cell">
                        <button
                          className="sp-icon-btn"
                          title={p.isActive ? 'Hide from store' : 'Make active'}
                          onClick={() => handleToggleActive(p)}
                        >
                          {p.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <Link
                          to={`/seller/products/${p._id}/edit`}
                          state={{ product: p }}
                          className="sp-icon-btn"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          className="sp-icon-btn sp-icon-btn-danger"
                          title="Delete"
                          onClick={() => handleDelete(p)}
                          disabled={deletingId === p._id}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="sp-pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadProducts(pagination.page - 1)}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadProducts(pagination.page + 1)}
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

export default SellerProducts;
