// AllProducts.jsx - FIXED with proper loading
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import ProductCard from '../ClientsComponent/ProductCard';
import AuthModal from '../ClientsComponent/LogInSignIn/AuthModal';
import './AllProduct.css';

const AllProduct = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getAvailableProducts, getAllCategories, loading: productsLoading } = useProducts(); // 👈 Get loading state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 👈 Local loading state

  // Get all unique categories from ProductContext
  const allCategories = getAllCategories();

  // 👈 FIXED: Wait for products to load before displaying
  useEffect(() => {
    if (!productsLoading) {
      loadProducts();
      setIsLoading(false);
    }
  }, [productsLoading]);

  useEffect(() => {
    // Listen for product updates
    const handleProductsUpdate = () => {
      if (!productsLoading) {
        loadProducts();
      }
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, [selectedCategory, productsLoading]);

  useEffect(() => {
    // Get category from URL parameter
    const categoryFromUrl = searchParams.get('category');
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      if (!productsLoading) {
        filterProducts(categoryFromUrl);
      }
    } else {
      setSelectedCategory('All');
      if (!productsLoading) {
        loadProducts();
      }
    }
  }, [searchParams, productsLoading]);

  const loadProducts = () => {
    const availableProducts = getAvailableProducts();
    setFilteredProducts(availableProducts);
    console.log('Loaded available products:', availableProducts.length); // Debug log
  };

  const filterProducts = (category) => {
    const availableProducts = getAvailableProducts();
    
    if (category === 'All') {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
    console.log('Filtered products for category', category, ':', filteredProducts.length); // Debug log
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    
    if (category === 'All') {
      setSearchParams({});
      loadProducts();
    } else {
      setSearchParams({ category });
      filterProducts(category);
    }
  };

  const handleLoginRequired = (product) => {
    setPendingProduct(product);
    setShowAuthModal(true);
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  // 👈 Show loading state
  if (isLoading) {
    return (
      <div className="all-products-page">
        <div className="container">
          <div className="products-loading">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="all-products-page">
        <div className="container">
          {/* Page Header */}
          <div className="all-products-header">
            <h1 className="all-products-title">All Products</h1>
            <p className="all-products-subtitle">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {allCategories.map((category, index) => (
              <button
                key={index}
                className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onLoginRequired={handleLoginRequired}
                />
              ))
            ) : (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            )}
          </div>
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

export default AllProduct;