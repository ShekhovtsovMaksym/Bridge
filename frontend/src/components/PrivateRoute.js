import React from 'react';
import { Navigate } from 'react-router-dom';
import InfoBar from './InfoBar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

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
