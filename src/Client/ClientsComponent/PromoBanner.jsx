import React from 'react';
import './PromoBanner.css';
import { FaTruck, FaCheckCircle, FaDollarSign, FaHeart } from 'react-icons/fa';

const PromoBanner = () => {
  return (
    <section className="promo-banner py-5">
      <div className="container">
        <div className="row align-items-center g-4">
          {/* Left Side - Image Section */}
          <div className="col-lg-6 col-md-12">
            <div className="image-container position-relative">
              <div className="green-circle"></div>
              <div className="promo-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop" 
                  alt="Happy woman with groceries" 
                  className="img-fluid promo-main-image"
                />
                <div className="floating-basket">
                  <img 
                    src="https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=200&h=200&fit=crop" 
                    alt="Fruit basket" 
                    className="img-fluid"
                  />
                </div>
                <div className="fast-delivery-badge">
                  <div className="d-flex align-items-center gap-2">
                    <div className="delivery-icon">
                      <FaTruck size={24} color="#6366F1" />
                    </div>
                    <div>
                      <div className="fw-bold text-primary">Fast Delivery</div>
                      <div className="text-muted small">In 30 Min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Features Section */}
          <div className="col-lg-6 col-md-12">
            <div className="features-content">
              <h2 className="section-title mb-4">Why We Are the Best?</h2>
              
              <div className="feature-list">
                <div className="feature-item d-flex gap-3 mb-4">
                  <div className="feature-icon flex-shrink-0">
                    <FaTruck size={24} color="white" />
                  </div>
                  <div>
                    <h4 className="feature-title mb-1">Fastest Delivery</h4>
                    <p className="feature-description mb-0">Groceries delivered in under 30 minutes.</p>
                  </div>
                </div>

                <div className="feature-item d-flex gap-3 mb-4">
                  <div className="feature-icon flex-shrink-0">
                    <FaCheckCircle size={24} color="white" />
                  </div>
                  <div>
                    <h4 className="feature-title mb-1">Freshness Guaranteed</h4>
                    <p className="feature-description mb-0">Fresh produce straight from the source.</p>
                  </div>
                </div>

                <div className="feature-item d-flex gap-3 mb-4">
                  <div className="feature-icon flex-shrink-0">
                    <FaDollarSign size={24} color="white" />
                  </div>
                  <div>
                    <h4 className="feature-title mb-1">Affordable Prices</h4>
                    <p className="feature-description mb-0">Quality groceries at unbeatable prices.</p>
                  </div>
                </div>

                <div className="feature-item d-flex gap-3">
                  <div className="feature-icon flex-shrink-0">
                    <FaHeart size={24} color="white" />
                  </div>
                  <div>
                    <h4 className="feature-title mb-1">Trusted by Thousands</h4>
                    <p className="feature-description mb-0">Loved by 10,000+ happy customers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;