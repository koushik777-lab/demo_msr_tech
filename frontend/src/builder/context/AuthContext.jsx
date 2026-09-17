import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, billingApi } from '../api/builderApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    try {
      const res = await billingApi.getSubscription();
      setSubscription(res.data);
    } catch {
      setSubscription({ plan: 'free', status: 'trial', limits: { sites: 1, custom_domain: false, watermark: true } });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('sitecraft_token');
    const savedUser = localStorage.getItem('sitecraft_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.role !== 'demo_user') loadSubscription();
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, [loadSubscription]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { access_token, refresh_token, user: u } = res.data;
    localStorage.setItem('sitecraft_token', access_token);
    localStorage.setItem('sitecraft_refresh', refresh_token);
    localStorage.setItem('sitecraft_user', JSON.stringify(u));
    setUser(u);
    await loadSubscription();
    return u;
  };

  const register = async (email, password, name) => {
    const res = await authApi.register(email, password, name);
    return res.data;
  };

  const verifyOtp = async (email, otpCode) => {
    const res = await authApi.verifyOtp(email, otpCode);
    const { access_token, refresh_token, user: u } = res.data;
    localStorage.setItem('sitecraft_token', access_token);
    localStorage.setItem('sitecraft_refresh', refresh_token);
    localStorage.setItem('sitecraft_user', JSON.stringify(u));
    setUser(u);
    await loadSubscription();
    return u;
  };

  const demoLogin = async () => {
    const res = await authApi.demo();
    const { access_token, refresh_token, user: u } = res.data;
    localStorage.setItem('sitecraft_token', access_token);
    localStorage.setItem('sitecraft_refresh', refresh_token);
    localStorage.setItem('sitecraft_user', JSON.stringify(u));
    setUser(u);
    setSubscription({ plan: 'pro', status: 'trial', limits: { sites: 999, custom_domain: true, watermark: false } });
    return u;
  };

  const logout = () => {
    localStorage.removeItem('sitecraft_token');
    localStorage.removeItem('sitecraft_refresh');
    localStorage.removeItem('sitecraft_user');
    setUser(null);
    setSubscription(null);
  };

  const isDemo = user?.role === 'demo_user';
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;
  const canPublish = !isDemo && subscription?.limits?.publish !== false;
  const canUseCustomDomain = !isDemo && subscription?.limits?.custom_domain === true;

  return (
    <AuthContext.Provider value={{
      user, subscription, loading, isDemo, isAdmin, isAuthenticated,
      canPublish, canUseCustomDomain,
      login, register, verifyOtp, demoLogin, logout, loadSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
