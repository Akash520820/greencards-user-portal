import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './MainBanner.css';
import { assets } from '../../assets/assets';

const MainBanner = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/AllProduct');
  };

  const handleExploreDeals = () => {
    navigate('/flash-sale');
  };

  return (
    <div className="MainBannerContainer" style={{backgroundImage: `url(${assets.main_banner_bg})`}}>
      <div className="container">
        <div className="row align-items-center MainBannerRow">
          <motion.div
            className="col-lg-6 col-md-6 col-12 MainBannerContent"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="MainBannerHeading">
              Freshness You Can Trust, Savings You will Love!
            </h1>
            <motion.div
              className="MainBannerButtons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                className="MainBannerButtonPrimary"
                onClick={handleShopNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Shop now
              </motion.button>
              <motion.button
                className="MainBannerButtonSecondary"
                onClick={handleExploreDeals}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore deals <span className="MainBannerArrow">→</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;