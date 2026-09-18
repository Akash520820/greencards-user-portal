import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiTrash, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useClientAuth } from '../../context/ClientAuthContext';
import { useCart } from '../../context/CartContext';
import * as wishlistApi from '../../api/wishlist.api';
import ProductCard from '../ClientsComponent/ProductCard';
import './Wishlist.css';

const Wishlist = () => {
  const { isAuthenticated } = useClientAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist();
      setItems(res.data.products || res.data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => (p.product?._id || p._id) !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="wishlist-empty-container text-center py-5">
        <HiOutlineHeart size={48} className="text-muted mb-3" />
        <h2>Please Login to View Wishlist</h2>
        <p>Save your favorite items and shop them anytime.</p>
        <Link to="/" className="btn btn-success rounded-pill px-4 mt-2">
          Go to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-loading text-center py-5">
        <div className="spinner-border text-success"></div>
        <p className="mt-2">Loading your saved items...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page py-4">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="wishlist-title m-0">
            <HiOutlineHeart className="text-danger me-2" /> My Wishlist ({items.length})
          </h1>
        </div>

        {items.length > 0 ? (
          <div className="row g-3">
            {items.map((item) => {
              const product = item.product || item;
              return (
                <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div className="wishlist-card-wrapper position-relative">
                    <ProductCard product={product} />
                    <button
                      type="button"
                      className="btn btn-danger btn-sm wishlist-remove-btn"
                      onClick={() => handleRemove(product._id)}
                      title="Remove from Wishlist"
                    >
                      <HiTrash size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wishlist-empty text-center py-5">
            <HiOutlineHeart size={64} className="text-muted mb-3" />
            <h3>Your Wishlist is Empty</h3>
            <p className="text-muted">Explore our catalog and save items you love!</p>
            <Link to="/AllProduct" className="btn btn-success rounded-pill px-4 mt-2">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
