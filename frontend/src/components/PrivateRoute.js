import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import InfoBar from './InfoBar';
import { useUser } from '../store/UserStore';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const { refresh } = useUser();

  useEffect(() => {
    // Ensure user identity is up-to-date whenever we enter a protected route or token changes
    if (token && typeof refresh === 'function') {
      try { refresh(); } catch (_) {}
    }
  }, [token, refresh]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <InfoBar />
      {children}
    </div>
  );
}

export default PrivateRoute;
