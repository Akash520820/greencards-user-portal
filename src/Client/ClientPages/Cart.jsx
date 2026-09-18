// Cart.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useClientAuth } from '../../context/ClientAuthContext';
import { useOrders } from '../../context/OrderContext';
import * as addressesApi from '../../api/addresses.api';
import * as ordersApi from '../../api/orders.api';

import CartHeader from '../ClientsComponent/Cart/CartHeader';
import CartItemsList from '../ClientsComponent/Cart/CartItemsList';
import EmptyCart from '../ClientsComponent/Cart/EmptyCart';
import CartLoading from '../ClientsComponent/Cart/CartLoading';
import AddressSection from '../ClientsComponent/Cart/AddressSection';
import PriceBreakdown from '../ClientsComponent/Cart/PriceBreakdown';
import AddressModal from '../ClientsComponent/Cart/AddressModal';
import PaymentModal from '../ClientsComponent/Cart/PaymentModal';

import './Cart.css';
import '../ClientsComponent/Cart/AddressModal.css';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Loads the Razorpay checkout script once and reuses it on later checkouts.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useClientAuth();
  const { createOrder } = useOrders();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const [isProcessingOrder, setIsProcessingOrder] = useState(false); // prevent double submission
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Load saved addresses from the real backend
  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await addressesApi.getAddresses();
      const normalized = res.data.map((a) => ({ ...a, id: a._id }));
      setAddresses(normalized);
      const defaultAddr = normalized.find((a) => a.isDefault) || normalized[0];
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  // Memoized price calculations
  const priceData = useMemo(() => {
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.02;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [getTotalPrice, cartItems]);

  const handleCloseModal = useCallback(() => {
    setShowAuthModal(false);
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = useCallback((cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(cartItemId, newQuantity);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((cartItemId) => {
    removeFromCart(cartItemId);
  }, [removeFromCart]);

  const handleContinueShopping = useCallback(() => {
    navigate('/AllProduct');
  }, [navigate]);

  const handleClearCart = useCallback(() => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontWeight: '600', color: '#2d3748' }}>
          Are you sure you want to clear your cart?
        </span>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              padding: '8px 16px',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearCart();
              toast.dismiss(t.id);
              toast.success('Cart cleared successfully', {
                duration: 2000,
                position: 'top-center',
              });
            }}
            style={{
              padding: '8px 16px',
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center',
      style: {
        background: '#fff',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    });
  }, [clearCart]);

  const handleAddressSelect = useCallback((addr) => {
    setSelectedAddress(addr);
    setShowAddressModal(false);
  }, []);

  const handleAddressSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const res = await addressesApi.addAddress(newAddress);
      const saved = { ...res.data, id: res.data._id };
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddress(saved);
      setShowAddressModal(false);
      setNewAddress({
        fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
      });
      toast.success('Address added successfully!', { duration: 2000, position: 'top-center' });
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
  }, [newAddress]);

  const handleCheckout = useCallback(() => {
    if (!selectedAddress) {
      toast.error('Please add a delivery address first', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    setShowPaymentModal(true);
  }, [selectedAddress]);

  const shippingAddressPayload = useCallback(() => ({
    fullName: selectedAddress.fullName,
    phone: selectedAddress.phone,
    addressLine1: selectedAddress.addressLine1,
    addressLine2: selectedAddress.addressLine2,
    city: selectedAddress.city,
    state: selectedAddress.state,
    pincode: selectedAddress.pincode,
    country: selectedAddress.country || 'India',
  }), [selectedAddress]);

  const finishOrder = useCallback(async () => {
    clearCart();
    setShowPaymentModal(false);
    toast.success('Order placed successfully! 🎉', {
      duration: 4000,
      position: 'top-center',
    });
    setTimeout(() => {
      navigate('/my-orders');
    }, 1000);
  }, [clearCart, navigate]);

  // paymentDetails.method is one of: cod | upi | card | netbanking
  // (upi/card/netbanking all route through Razorpay's own hosted checkout,
  // which natively offers those methods — no card/UPI details are collected
  // or transmitted by this app directly.)
  const handlePaymentComplete = useCallback(async (paymentDetails) => {
    if (isProcessingOrder) return;
    setIsProcessingOrder(true);

    try {
      if (paymentDetails.method === 'cod') {
        await createOrder({
          shippingAddress: shippingAddressPayload(),
          paymentMethod: 'cod',
        });
        await finishOrder();
        return;
      }

      // Online payment — real Razorpay checkout
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !RAZORPAY_KEY_ID) {
        toast.error('Online payment is not available right now. Please try Cash on Delivery.');
        setIsProcessingOrder(false);
        return;
      }

      const rpOrderRes = await ordersApi.createRazorpayOrder({});
      const { razorpayOrderId, amount, currency } = rpOrderRes.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'GreenCards',
        description: 'Order payment',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.fullName || user?.userName,
          email: user?.email,
          contact: selectedAddress?.phone,
        },
        theme: { color: '#4CAF50' },
        handler: async (response) => {
          try {
            await createOrder({
              shippingAddress: shippingAddressPayload(),
              paymentMethod: 'razorpay',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await finishOrder();
          } catch (err) {
            toast.error(err.message || 'Payment succeeded but order creation failed. Contact support.');
          } finally {
            setIsProcessingOrder(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessingOrder(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
      setIsProcessingOrder(false);
    }
  }, [isProcessingOrder, createOrder, shippingAddressPayload, finishOrder, user, selectedAddress]);

  // Reset processing state when modal closes
  useEffect(() => {
    if (!showPaymentModal) {
      setIsProcessingOrder(false);
    }
  }, [showPaymentModal]);

  // Early returns
  if (!isAuthenticated) {
    return (
      <CartLoading 
        showModal={showAuthModal}
        onCloseModal={handleCloseModal}
        redirectTo="/cart"
      />
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart onStartShopping={handleContinueShopping} />;
  }

  return (
    <div className="cart-page">
      <Toaster />
      <div className="container">
        <CartHeader itemCount={cartItems.length} />

        <div className="cart-content">
          <CartItemsList
            items={cartItems}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
            onClearCart={handleClearCart}
          />

          <div className="cart-summary-section">
            <div className="cart-summary">
              <h2 className="cart-summary-title">Order Summary</h2>
              
              <AddressSection
                selectedAddress={selectedAddress}
                onChangeAddress={() => setShowAddressModal(true)}
              />

              <PriceBreakdown
                subtotal={priceData.subtotal}
                tax={priceData.tax}
                total={priceData.total}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
                onRemoveCoupon={() => setAppliedCoupon(null)}
              />


              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                Continue Shopping
              </button>

              <div className="cart-summary-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>

        <AddressModal
          show={showAddressModal}
          addresses={addresses}
          selectedAddress={selectedAddress}
          newAddress={newAddress}
          onClose={() => setShowAddressModal(false)}
          onAddressSelect={handleAddressSelect}
          onAddressChange={setNewAddress}
          onSubmit={handleAddressSubmit}
        />

        <PaymentModal
          show={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderTotal={priceData.subtotal}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
};

export default Cart;