import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiSparkles } from 'react-icons/hi2';
import { useProducts } from '../../../context/ProductContext';
import { categories as fallbackCategories } from '../../../assets/assets';
import './CategoryMegaMenu.css';

const CategoryMegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { categories: dbCategories } = useProducts();
  const navigate = useNavigate();

  const displayCategories = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((dbCat) => {
        const match = fallbackCategories.find(
          (f) => f.text.toLowerCase() === dbCat.name.toLowerCase() || f.path.toLowerCase() === dbCat.name.toLowerCase()
        );
        return {
          name: dbCat.name,
          image: dbCat.image || match?.image || fallbackCategories[0].image,
          path: dbCat.name,
        };
      })
    : fallbackCategories.map((f) => ({ name: f.text, image: f.image, path: f.path }));

  const handleSelect = (categoryName) => {
    setIsOpen(false);
    navigate(`/AllProduct?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div
      className="mega-menu-wrapper"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`mega-menu-trigger ${isOpen ? 'active' : ''}`}
        aria-expanded={isOpen}
      >
        <span>Categories</span>
        <HiChevronDown className={`mega-menu-chevron ${isOpen ? 'open' : ''}`} size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mega-menu-dropdown"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mega-menu-header">
              <span className="mega-menu-badge">
                <HiSparkles size={14} /> Explore Department
              </span>
              <Link to="/AllProduct" className="mega-menu-view-all" onClick={() => setIsOpen(false)}>
                View All Catalog →
              </Link>
            </div>

            <div className="mega-menu-grid">
              {displayCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="mega-menu-item"
                  onClick={() => handleSelect(cat.name)}
                >
                  <img src={cat.image} alt={cat.name} className="mega-menu-item-img" />
                  <div className="mega-menu-item-info">
                    <span className="mega-menu-item-title">{cat.name}</span>
                    <span className="mega-menu-item-sub">Explore collection</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryMegaMenu;
