import React, { createContext, useContext, useState, useCallback } from 'react';
import * as ordersApi from '../api/orders.api';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useCallback with an empty dependency array keeps this function's identity
  // stable across re-renders. Without it, every setLoading/setOrders call
  // inside this function re-renders OrderProvider, which recreates this
  // function, which changes the identity any consumer's useEffect depends
  // on (e.g. MyOrders.jsx's `loadOrders` useCallback) — causing that effect
  // to re-fire immediately and re-fetch in an infinite loop, which is what
  // was actually causing "My Orders" to appear stuck loading.
  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getMyOrders();
      setOrders(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // admin only — status: "processing" | "shipped" | "delivered" | "cancelled"
  const fetchAllOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await ordersApi.getAllOrders(params);
      setOrders(res.data.orders);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Error fetching all orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // payload: { shippingAddress, paymentMethod, productId?, quantity?, variant?,
  //            razorpayOrderId?, razorpayPaymentId?, razorpaySignature? }
  // omit productId to check out everything currently in the server cart
  const createOrder = async (payload) => {
    const res = await ordersApi.placeOrder(payload);
    setOrders((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateOrderStatus = async (orderId, status) => {
    const res = await ordersApi.updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
    return res.data;
  };

  const getOrderStats = () => ({
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.orderStatus === 'processing').length,
    completedOrders: orders.filter((o) => o.orderStatus === 'delivered').length,
    totalRevenue: orders
      .filter((o) => o.orderStatus === 'delivered')
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0),
  });

  const getOrderById = (orderId) => orders.find((order) => order._id === orderId);

  const fetchOrderById = async (orderId) => {
    const res = await ordersApi.getOrderById(orderId);
    return res.data;
  };

  const value = {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchAllOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    getOrderStats,
    getOrderById,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export default OrderContext;