import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CategoryCard from './CategoryCard';
import { categories as fallbackCategories } from '../../assets/assets';
import { useProducts } from '../../context/ProductContext';
import './CategoriesSection.css';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const CategoriesSection = () => {
  const navigate = useNavigate();
  const { categories: dbCategories } = useProducts();

  // Combine DB categories with fallback assets for rich thumbnails & colors
  const displayCategories = (dbCategories && dbCategories.length > 0)
    ? dbCategories.map((dbCat) => {
        const match = fallbackCategories.find(
          (f) =>
            f.text.toLowerCase() === dbCat.name.toLowerCase() ||
            f.path.toLowerCase() === dbCat.name.toLowerCase() ||
            f.path.toLowerCase() === (dbCat.slug || '').toLowerCase()
        );
        return {
          text: dbCat.name,
          path: dbCat.name,
          image: dbCat.image || match?.image || fallbackCategories[0].image,
          bgColor: match?.bgColor || '#F0F5DE',
        };
      })
    : fallbackCategories;

  const handleCategoryClick = (path) => {
    navigate(`/AllProduct?category=${encodeURIComponent(path)}`);
  };

  return (
    <div className="categories-section">
      <div className="container">
        <h2 className="categories-section-title">Categories</h2>
        <motion.div
          className="categories-grid"
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {displayCategories.map((category, index) => (
            <motion.div key={category.text || index} variants={itemVariants}>
              <CategoryCard
                category={category}
                onClick={handleCategoryClick}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriesSection;