import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.api';

const ClientAuthContext = createContext();

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
};

export const ClientAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session lives in httpOnly cookies set by the backend, so on mount we just
  // ask the server who (if anyone) the current cookie belongs to.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getCurrentUser();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // STEP 1 of registration — sends an OTP, does not log the user in yet.
  // userData should be a FormData containing userName, email, fullName,
  // password, phone, avatar (file).
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.registerUser(userData);
      return { success: true, email: res.data.email, message: res.message };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 — verifying the OTP actually creates the account and logs in.
  const verifyOtp = async (email, otp) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyRegistrationOtp(email, otp);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await authApi.resendRegistrationOtp(email);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // identifier can be an email or a username
  const login = async (identifier, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const isEmail = identifier.includes('@');
      const res = await authApi.loginUser({
        email: isEmail ? identifier : undefined,
        userName: isEmail ? undefined : identifier,
        password,
      });
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await authApi.forgotPassword(email);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await authApi.resetPassword(email, otp, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } catch {
      // even if the server call fails, clear the local session
    }
    setUser(null);
    window.dispatchEvent(new Event('cartClear'));
  };

  const value = {
    user,
    isLoading,
    error,
    register,
    verifyOtp,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    logout,
    isAuthenticated: !!user,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};
