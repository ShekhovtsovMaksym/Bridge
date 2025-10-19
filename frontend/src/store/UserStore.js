import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const backoffRef = useRef(1000); // start with 1s
  const retryTimerRef = useRef(null);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const fetchMe = useCallback(async () => {
    clearRetryTimer();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setData(null);
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data || null);
      setLoading(false);
      setError(null);
      backoffRef.current = 1000; // reset backoff on success
    } catch (e) {
      setLoading(false);
      setError('Failed to load user data');
      // schedule retry with exponential backoff up to 30s
      const next = Math.min(backoffRef.current * 2, 30000);
      retryTimerRef.current = setTimeout(() => {
        fetchMe();
      }, backoffRef.current);
      backoffRef.current = next;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    fetchMe();
    return () => clearRetryTimer();
  }, [fetchMe]);

  const value = {
    data,
    loading,
    error,
    refresh,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
