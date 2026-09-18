import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { useClientAuth } from '../../context/ClientAuthContext';
import AuthModal from '../ClientsComponent/LogInSignIn/AuthModal';
import toast, { Toaster } from 'react-hot-toast';
import { HiStar, HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import * as reviewsApi from '../../api/reviews.api';
import * as wishlistApi from '../../api/wishlist.api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { getProductById, getProductsByCategory } = useProducts();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated } = useClientAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      const res = await reviewsApi.getProductReviews(productId);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching product reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const foundProduct = getProductById(productId);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(0);
      setQuantity(1);
      // auto-select when there's only one color option, otherwise force an explicit pick
      setSelectedColor(
        foundProduct.colorVariants?.length === 1 ? foundProduct.colorVariants[0].color : null
      );
      setSelectedSize(null);

      const related = getProductsByCategory(foundProduct.category)
        .filter((p) => p._id !== productId)
        .slice(0, 4);
      setRelatedProducts(related);
    } else {
      navigate('/AllProduct');
    }
  }, [productId, getProductById, getProductsByCategory, navigate]);

  useEffect(() => {
    if (product) {
      const inCart = cartItems.some((item) => item._id === product._id);
      setIsInCart(inCart);
      fetchReviews();
    }
  }, [cartItems, product, fetchReviews]);

  if (!product) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  const discountPercentage = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const currentPrice = product.offerPrice || product.price;

  // ---- Variant derivation ----
  const needsColor = (product.colorVariants?.length || 0) > 0;
  const activeColorVariant = needsColor
    ? product.colorVariants.find((cv) => cv.color === selectedColor)
    : null;
  const needsSize = (activeColorVariant?.sizes?.length || 0) > 1;
  const variantReady = !needsColor || (!!selectedColor && (!needsSize || !!selectedSize));

  const activeSizeEntry = activeColorVariant
    ? activeColorVariant.sizes.find((s) => s.size === (selectedSize || activeColorVariant.sizes[0]?.size))
    : null;
  const selectedStock = needsColor ? activeSizeEntry?.stock ?? 0 : product.stock;

  const buildVariant = () =>
    needsColor
      ? { color: selectedColor, size: selectedSize || activeColorVariant?.sizes[0]?.size }
      : undefined;

  const validateSelection = () => {
    if (needsColor && !selectedColor) {
      toast.error('Please select a color');
      return false;
    }
    if (needsSize && !selectedSize) {
      toast.error('Please select a size');
      return false;
    }
    if (selectedStock <= 0) {
      toast.error('This option is out of stock');
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isInCart) {
      navigate('/cart');
      return;
    }

    if (!validateSelection() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await addToCart(product, quantity, buildVariant());
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(result.error || 'Could not add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!isInCart) {
      if (!validateSelection() || isSubmitting) return;

      setIsSubmitting(true);
      const result = await addToCart(product, quantity, buildVariant());
      setIsSubmitting(false);

      if (!result.success) {
        toast.error(result.error || 'Could not add to cart');
        return;
      }
    }
    navigate('/cart');
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(product._id);
        setIsWishlisted(false);
        toast.success('Removed from Wishlist');
      } else {
        await wishlistApi.addToWishlist(product._id);
        setIsWishlisted(true);
        toast.success('Saved to Wishlist!');
      }
    } catch (err) {
      toast.error('Wishlist update failed');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!newComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsApi.createReview({
        product: product._id,
        rating: newRating,
        comment: newComment.trim(),
      });
      toast.success('Review posted successfully!');
      setNewComment('');
      fetchReviews();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="pd-page">
        <div className="container">
          {/* Product Details Section */}
          <div className="pd-container">
            {/* Gallery */}
            <div className="pd-gallery">
              <div className="pd-main-image">
                <img src={product.image[selectedImage]} alt={product.name} />
                {discountPercentage > 0 && (
                  <span className="pd-discount-badge">{discountPercentage}% OFF</span>
                )}
              </div>
              <div className="pd-thumbnail-images">
                {product.image.map((img, index) => (
                  <div
                    key={index}
                    className={`pd-thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="pd-info">
              <div className="pd-category">{product.category}</div>
              <h1 className="pd-name">{product.name}</h1>

              {/* Rating */}
              <div className="pd-rating">
                <div className="pd-stars">
                  {[...Array(5)].map((_, i) => (
                    <HiStar
                      key={i}
                      size={18}
                      className={i < Math.floor(product.ratings?.average || 4) ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
                <span className="pd-rating-count">
                  ({(product.ratings?.average || 4.0).toFixed(1)}) · {reviews.length} Reviews
                </span>
              </div>

              {/* Pricing */}
              <div className="pd-price-section">
                <div className="pd-price-row">
                  <span className="pd-current-price">₹{currentPrice}</span>
                  {product.offerPrice && (
                    <>
                      <span className="pd-original-price">₹{product.price}</span>
                      <span className="pd-save-amount">Save ₹{product.price - product.offerPrice}</span>
                    </>
                  )}
                </div>
                <p className="pd-tax-info">Inclusive of all taxes</p>
              </div>

              {/* Color / Size selection */}
              {needsColor && (
                <div className="pd-variant-section mb-4">
                  <label className="d-block mb-2">Color:</label>
                  <div className="pd-color-swatches">
                    {product.colorVariants.map((cv) => (
                      <button
                        key={cv.color}
                        type="button"
                        className={`pd-color-swatch ${selectedColor === cv.color ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedColor(cv.color);
                          setSelectedSize(null);
                        }}
                      >
                        {cv.color}
                      </button>
                    ))}
                  </div>

                  {activeColorVariant?.sizes?.length > 1 ? (
                    <>
                      <label className="d-block mt-3 mb-2">Size:</label>
                      <div className="pd-size-buttons">
                        {activeColorVariant.sizes.map((s) => (
                          <button
                            key={s.size}
                            type="button"
                            disabled={s.stock <= 0}
                            className={`pd-size-btn ${selectedSize === s.size ? 'active' : ''}`}
                            onClick={() => setSelectedSize(s.size)}
                          >
                            {s.size}{s.stock <= 0 ? ' (Out of stock)' : ''}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    activeColorVariant?.sizes?.length === 1 && (
                      <>
                        <label className="d-block mt-3 mb-2">Size:</label>
                        <div className="pd-size-buttons">
                          <span className="pd-size-btn active pd-size-fixed">
                            {activeColorVariant.sizes[0].size}
                          </span>
                        </div>
                      </>
                    )
                  )}
                </div>
              )}

              {/* Quantity & Wishlist */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="pd-quantity-section mb-0">
                  <label>Quantity:</label>
                  <div className="pd-quantity-controls">
                    <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                      -
                    </button>
                    <span className="pd-quantity-value">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn btn-outline-danger rounded-pill px-3 py-2 ${isWishlisted ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  {isWishlisted ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
                  <span className="ms-1">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="pd-actions">
                <button
                  className={`pd-add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                  onClick={handleAddToCart}
                  disabled={!isInCart && (!variantReady || selectedStock <= 0 || isSubmitting)}
                >
                  {isInCart
                    ? 'Go to Cart'
                    : selectedStock <= 0 && variantReady
                    ? 'Out of Stock'
                    : isSubmitting
                    ? 'Adding…'
                    : 'Add to Cart'}
                </button>
                <button
                  className="pd-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={!isInCart && (!variantReady || selectedStock <= 0 || isSubmitting)}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pd-description-section mt-5">
            <h2>Product Description</h2>
            <div className="pd-description-content">
              {Array.isArray(product.description) && product.description.length > 0 ? (
                <ul>
                  {product.description.map((desc, index) => (
                    <li key={index}>{desc}</li>
                  ))}
                </ul>
              ) : (
                <p>{product.description || `Premium quality ${product.name} from the ${product.category} collection.`}</p>
              )}
            </div>
          </div>

          {/* Customer Reviews Section (Dynamic) */}
          <div className="pd-reviews-section mt-5">
            <h2>Customer Reviews ({reviews.length})</h2>

            {/* Post Review Form */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
              <h4 className="mb-3">Write a Review</h4>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="form-label me-2 fw-semibold">Rating:</label>
                  <div className="d-inline-flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <HiStar
                        key={star}
                        size={24}
                        style={{ cursor: 'pointer' }}
                        className={star <= newRating ? 'star-filled' : 'star-empty'}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Share your experience with this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev._id} className="card border-0 shadow-sm p-3" style={{ borderRadius: '12px' }}>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold">{rev.user?.userName || rev.user?.fullName || 'Verified Buyer'}</span>
                      <div className="d-flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <HiStar key={i} size={16} className={i < rev.rating ? 'star-filled' : 'star-empty'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary m-0">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No customer reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>

      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} pendingProduct={product} />
    </>
  );
};

export default ProductDetails;