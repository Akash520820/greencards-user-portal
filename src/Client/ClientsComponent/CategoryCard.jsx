import React from 'react';
import { motion } from 'framer-motion';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
  return (
    <motion.div 
      className="category-card" 
      style={{ backgroundColor: category.bgColor }}
      onClick={() => onClick && onClick(category.path)}
      whileHover={{ y: -5, scale: 1.025, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`Browse ${category.text}`}
    >
      <div className="category-card-image">
        <img src={category.image} alt={category.text} loading="lazy" />
      </div>
      <h3 className="category-card-title">{category.text}</h3>
    </motion.div>
  );
};

export default CategoryCard;