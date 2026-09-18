import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cart.api';
import { useClientAuth } from './ClientAuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Turns a raw backend cart item ({ _id, product, quantity, variant }) into the
// flat shape the existing UI (ProductCard, CartItem, ProductDetails...) expects.
const normalizeCartItem = (item) => {
  const product = item.product || {};
  return {
    _id: product._id,
    cartItemId: item._id,
    productId: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images || [],
    price: product.price,
    offerPrice: product.discountPrice > 0 ? product.discountPrice : null,
    stock: product.stock,
    colorVariants: product.colorVariants || [],
    quantity: item.quantity,
    variant: item.variant,
  };
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useClientAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCartItems((res.data.items || []).map(normalizeCartItem));
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Cleared on logout (ClientAuthContext dispatches this)
  useEffect(() => {
    const handleCartClear = () => setCartItems([]);
    window.addEventListener('cartClear', handleCartClear);
    return () => window.removeEventListener('cartClear', handleCartClear);
  }, []);

  const addToCart = async (product, quantity = 1, variant) => {
    try {
      const res = await cartApi.addToCart(product._id, quantity, variant);
      setCartItems((res.data.items || []).map(normalizeCartItem));
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      return { success: false, error: err.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await cartApi.removeFromCart(cartItemId);
      setCartItems((res.data.items || []).map(normalizeCartItem));
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }
    try {
      const res = await cartApi.updateCartItem(cartItemId, quantity);
      setCartItems((res.data.items || []).map(normalizeCartItem));
    } catch (err) {
      console.error('Error updating cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  const getTotalPrice = () =>
    cartItems.reduce((total, item) => {
      const price = item.offerPrice || item.price || 0;
      return total + price * item.quantity;
    }, 0);

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
