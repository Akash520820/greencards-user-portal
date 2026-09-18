import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as productsApi from '../api/products.api';
import * as categoriesApi from '../api/categories.api';

const ProductContext = createContext();

const normalizeProduct = (p) => {
  if (!p || typeof p !== 'object') return null;

  const totalVariantStock = (p.colorVariants || []).reduce(
    (sum, cv) => sum + (cv.sizes || []).reduce((s, sz) => s + (sz.stock || 0), 0),
    0
  );
  const stock = (p.colorVariants && p.colorVariants.length > 0) ? totalVariantStock : (p.stock || 0);

  return {
    ...p,
    _id: p._id,
    name: p.name || 'Product',
    slug: p.slug || '',
    description: p.description || '',
    image: Array.isArray(p.images) ? p.images : (p.image ? (Array.isArray(p.image) ? p.image : [p.image]) : []),
    price: p.price || 0,
    offerPrice: p.discountPrice > 0 ? p.discountPrice : undefined,
    category: typeof p.category === 'object' && p.category !== null ? (p.category.name || '') : (p.category || ''),
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category._id : p.category,
    stock,
    inStock: stock > 0,
    colorVariants: p.colorVariants || [],
    sku: p.sku,
    brand: p.brand,
    ratings: p.ratings || { average: 4.0, count: 4 },
  };
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await productsApi.getAllProducts({ limit: 100, ...params });
      const rawProducts = Array.isArray(res?.products)
        ? res.products
        : Array.isArray(res?.data?.products)
        ? res.data.products
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      const normalized = rawProducts.map(normalizeProduct).filter(Boolean);
      setProducts(normalized);

      const pag = res?.pagination || res?.data?.pagination || { total: normalized.length, page: 1, totalPages: 1 };
      setPagination(pag);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.getAllCategories();
      const rawCategories = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCategories(rawCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const addProduct = async (productData) => {
    const res = await productsApi.createProduct(productData);
    const normalized = normalizeProduct(res.data || res);
    if (normalized) {
      setProducts((prev) => [normalized, ...prev]);
    }
    return normalized;
  };

  const updateProduct = async (productId, productData) => {
    const res = await productsApi.updateProduct(productId, productData);
    const normalized = normalizeProduct(res.data || res);
    if (normalized) {
      setProducts((prev) => prev.map((p) => (p._id === productId ? normalized : p)));
    }
    return normalized;
  };

  const deleteProduct = async (productId) => {
    await productsApi.deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const updateStock = async (productId, payload) => {
    const res = await productsApi.updateStock(productId, payload);
    const normalized = normalizeProduct(res.data || res);
    if (normalized) {
      setProducts((prev) => prev.map((p) => (p._id === productId ? normalized : p)));
    }
    return normalized;
  };

  const getAvailableProducts = () => (Array.isArray(products) ? products.filter((p) => p && p.inStock) : []);

  const getProductsByCategory = (category) => {
    const list = getAvailableProducts();
    if (!category || category === 'All') return list;
    const catLower = category.toLowerCase().trim();
    return list.filter((p) => {
      const pCatLower = (p.category || '').toLowerCase().trim();
      const pCatId = (p.categoryId || '').toString();
      return (
        pCatLower === catLower ||
        pCatId === category ||
        pCatLower.includes(catLower) ||
        catLower.includes(pCatLower)
      );
    });
  };

  const getProductById = (productId) => (Array.isArray(products) ? products.find((p) => p && p._id === productId) : undefined);

  const searchProducts = (searchTerm) => {
    const list = getAvailableProducts();
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) || p.category?.toLowerCase().includes(term)
    );
  };

  const getAllCategories = () => {
    const list = Array.isArray(categories) ? categories : [];
    const catNames = list
      .map((c) => (typeof c === 'string' ? c : c?.name))
      .filter(Boolean);
    return ['All', ...new Set(catNames)];
  };

  const getSellerStats = () => {
    const list = Array.isArray(products) ? products : [];
    return {
      totalProducts: list.length,
      inStock: list.filter((p) => p && p.inStock).length,
      outOfStock: list.filter((p) => p && !p.inStock).length,
    };
  };

  const value = {
    products,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getAvailableProducts,
    getProductsByCategory,
    getProductById,
    searchProducts,
    getAllCategories,
    getSellerStats,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export default ProductContext;
