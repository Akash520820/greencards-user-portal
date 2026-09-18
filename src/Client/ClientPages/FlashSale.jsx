// FlashSale.jsx - Flash Sale Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../ClientsComponent/ProductCard';
import AuthModal from '../ClientsComponent/LogInSignIn/AuthModal';
import * as productsApi from '../../api/products.api';
import './FlashSale.css';

const FlashSale = () => {
  const navigate = useNavigate();
  const { getAvailableProducts, loading: productsLoading } = useProducts();
  const [dealProducts, setDealProducts] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetEndsAt, setTargetEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Fetch flash sale items from API
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        setIsLoading(true);
        const res = await productsApi.getFlashSaleProducts();
        if (res.data && res.data.products && res.data.products.length > 0) {
          setDealProducts(res.data.products);
          if (res.data.flashSaleEndsAt) {
            setTargetEndsAt(new Date(res.data.flashSaleEndsAt));
          }
        } else {
          loadFallbackProducts();
        }
      } catch (err) {
        loadFallbackProducts();
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashSale();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsLoading]);

  const loadFallbackProducts = () => {
    const available = getAvailableProducts();
    const deals = available.filter(p => p.discountPrice || p.offerPrice || p.isFlashSale);
    setDealProducts(deals.length > 0 ? deals : available.slice(0, 8));
  };

  // Live Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = targetEndsAt || new Date(new Date().setHours(23, 59, 59, 999));
      const difference = target - now;
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetEndsAt]);

  const handleLoginRequired = (product) => {
    setPendingProduct(product);
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="flash-sale-page">
        <div className="container">
          <div className="products-loading">
            <div className="spinner"></div>
            <p>Loading flash deals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flash-sale-page">
        <div className="container">
          {/* Flash Sale Header */}
          <div className="flash-sale-header">
            <div className="flash-sale-title-section">
              <h1 className="flash-sale-title">
                <span className="flash-icon">⚡</span>
                Flash Sale
              </h1>
              <p className="flash-sale-subtitle">
                Limited time offers - Grab them before they're gone!
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="countdown-timer">
              <div className="timer-label">Ends In</div>
              <div className="timer-boxes">
                <div className="timer-box">
                  <div className="timer-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="timer-unit">Hours</div>
                </div>
                <div className="timer-separator">:</div>
                <div className="timer-box">
                  <div className="timer-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="timer-unit">Minutes</div>
                </div>
                <div className="timer-separator">:</div>
                <div className="timer-box">
                  <div className="timer-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="timer-unit">Seconds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Deal Stats - Clickable Filter Cards */}
          <div className="deal-stats">
            <div 
              className="stat-card clickable-stat-card" 
              onClick={() => navigate('/all-products?filter=hot-deals')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <div className="stat-value">{dealProducts.length}</div>
                <div className="stat-label">Hot Deals</div>
              </div>
            </div>
            <div 
              className="stat-card clickable-stat-card" 
              onClick={() => navigate('/all-products?filter=discount')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">Up to 50%</div>
                <div className="stat-label">Discount</div>
              </div>
            </div>
            <div 
              className="stat-card clickable-stat-card" 
              onClick={() => navigate('/all-products?filter=free-shipping')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon">🚚</div>
              <div className="stat-content">
                <div className="stat-value">Free</div>
                <div className="stat-label">Shipping</div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {dealProducts.length > 0 ? (
            <div className="flash-sale-grid">
              {dealProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onLoginRequired={handleLoginRequired}
                />
              ))}
            </div>
          ) : (
            <div className="no-deals">
              <div className="no-deals-icon">😔</div>
              <h3>No Flash Deals Available</h3>
              <p>Check back later for amazing deals!</p>
            </div>
          )}
        </div>
      </div>

      <AuthModal 
        show={showAuthModal} 
        onClose={handleCloseModal}
        pendingProduct={pendingProduct}
        onProductAdded={() => setPendingProduct(null)}
      />
    </>
  );
};

export default FlashSale;