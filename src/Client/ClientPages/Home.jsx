import "./Home.css";
import MainBanner from '../ClientsComponent/MainBanner';
import CategoriesSection from '../ClientsComponent/CategoriesSection';
import BestSeller from '../ClientsComponent/BestSeller';
import PromoBanner from '../ClientsComponent/PromoBanner';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';


const Home = () => {
  const { loading: productsLoading } = useProducts();
  const location = useLocation();

  useEffect(() => {
    if (!productsLoading && location.hash === '#bestsellers') {
      document.getElementById('bestsellers')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [productsLoading, location.hash]);

  if (productsLoading) {
    return (
      <div className="home-page">
        <div className="container">
          <div className="products-loading">
            <div className="spinner"></div>
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container  Homecontainer'>
      <MainBanner />
      <CategoriesSection />
      <div id="bestsellers">
        <BestSeller />
      </div>
      <PromoBanner />
    </div>
  );
};

export default Home;