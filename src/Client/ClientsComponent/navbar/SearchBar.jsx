import React, { useState, useRef, useEffect } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { HiPlus, HiCheck } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../../context/ProductContext';
import { useCart } from '../../../context/CartContext';
import { useClientAuth } from '../../../context/ClientAuthContext';
import './SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { searchProducts } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useClientAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const results = searchTerm.trim() ? searchProducts(searchTerm).slice(0, 5) : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      navigate(`/AllProduct?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleProductSelect = (productId) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(`/product/${productId}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    if (isAuthenticated) {
      addToCart(product);
    } else {
      setIsOpen(false);
      navigate('/cart');
    }
  };

  return (
    <div className="search-wrapper position-relative" ref={wrapperRef}>
      <form onSubmit={handleSearchSubmit} className="d-flex align-items-center w-100">
        <input
          className="form-control search-input"
          type="search"
          placeholder="Search products, brands & categories..."
          aria-label="Search"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <button className="search-btn btn ms-2" type="submit" aria-label="Search">
          <IoIosSearch size={22} aria-hidden="true" />
        </button>
      </form>

      {/* Live Predictive Search Popover */}
      <AnimatePresence>
        {isOpen && searchTerm.trim().length > 0 && (
          <motion.div
            className="search-popover"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="search-popover-header">
              <span className="search-popover-title">Product Matches</span>
              <span className="search-popover-count">{results.length} found</span>
            </div>

            {results.length > 0 ? (
              <div className="search-results-list">
                {results.map((product) => {
                  const isInCart = cartItems.some((item) => item._id === product._id);
                  return (
                    <div
                      key={product._id}
                      className="search-result-item"
                      onClick={() => handleProductSelect(product._id)}
                    >
                      <img
                        src={Array.isArray(product.image) ? product.image[0] : product.image}
                        alt={product.name}
                        className="search-result-img"
                      />
                      <div className="search-result-info">
                        <span className="search-result-name">{product.name}</span>
                        <span className="search-result-category">{product.category}</span>
                      </div>
                      <div className="search-result-price-action">
                        <span className="search-result-price">
                          ₹{product.offerPrice || product.price}
                        </span>
                        <button
                          type="button"
                          className={`search-quick-add-btn ${isInCart ? 'in-cart' : ''}`}
                          onClick={(e) => handleQuickAdd(e, product)}
                          title={isInCart ? 'In Cart' : 'Quick Add'}
                        >
                          {isInCart ? <HiCheck size={14} /> : <HiPlus size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-no-results">
                <p>No products found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;