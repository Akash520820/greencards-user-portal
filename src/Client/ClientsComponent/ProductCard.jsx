import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiCheck, HiStar, HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext';
import { useClientAuth } from '../../context/ClientAuthContext';
import * as wishlistApi from '../../api/wishlist.api';
import './ProductCard.css';

const ProductCard = memo(({ product, onLoginRequired }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useClientAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const inCart = cartItems.some((item) => item._id === product._id);
    setIsInCart(inCart);
  }, [cartItems, product._id]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onLoginRequired) {
        onLoginRequired(product);
      }
      return;
    }

    if (isInCart || isSubmittingRef.current) return;

    // this product needs a color/size choice — the quick-add button has no
    // picker, so send them to the product page instead of failing silently
    if (product.colorVariants?.length > 0) {
      navigate(`/product/${product._id}`);
      return;
    }

    isSubmittingRef.current = true;
    setIsAdding(true);

    const result = await addToCart(product);
    if (!result.success) {
      console.error('Add to cart failed:', result.error);
    }

    setIsAdding(false);
    isSubmittingRef.current = false;
  };

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onLoginRequired) onLoginRequired(product);
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product._id);
        setIsWishlisted(false);
      } else {
        await wishlistApi.addToWishlist(product._id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const discountPercentage = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    hover: {
      y: -6,
      boxShadow: '0 16px 32px rgba(15, 23, 42, 0.12)',
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
    tap: { scale: 0.985 },
  };

  const ratingVal = product.ratings?.average || 4.0;
  const ratingCount = product.ratings?.count || 4;

  return (
    <motion.div
      className="product-card-bestseller"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      style={{ cursor: 'pointer' }}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
    >
      <div className="product-card-image-container">
        <motion.img
          src={Array.isArray(product.image) ? product.image[0] : product.image}
          alt={product.name}
          className="product-card-image"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
        {discountPercentage > 0 && (
          <span className="product-card-discount-badge">
            {discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          className={`product-card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label="Wishlist toggle"
        >
          {isWishlisted ? <HiHeart size={18} className="heart-filled" /> : <HiOutlineHeart size={18} />}
        </button>

        <AnimatePresence>
          {isInCart && (
            <motion.div
              className="product-card-in-cart-badge"
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <HiCheck size={14} />
              Added
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="product-card-content">
        <p className="product-card-category">{product.category || 'Grocery'}</p>
        <h3 className="product-card-name">{product.name}</h3>

        {/* Rating */}
        <div className="product-card-rating" aria-label={`Rated ${ratingVal} out of 5 stars`}>
          <div className="product-card-stars">
            {[...Array(5)].map((_, i) => (
              <HiStar
                key={i}
                size={14}
                className={i < Math.floor(ratingVal) ? 'star-filled' : 'star-empty'}
              />
            ))}
          </div>
          <span className="product-card-rating-count">({ratingCount})</span>
        </div>

        <div className="product-card-footer">
          <div className="product-card-pricing">
            {product.offerPrice ? (
              <>
                <span className="product-card-price-offer">₹{product.offerPrice}</span>
                <span className="product-card-price-original">₹{product.price}</span>
              </>
            ) : (
              <span className="product-card-price-offer">₹{product.price}</span>
            )}
          </div>

          <motion.button
            className={`product-card-add-btn ${isAdding ? 'adding' : ''} ${isInCart ? 'in-cart' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || isInCart}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {isInCart ? (
              <>
                <HiCheck size={16} />
                Added
              </>
            ) : (
              <>
                <HiOutlineShoppingBag size={16} />
                {isAdding ? 'Adding…' : 'Add'}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;