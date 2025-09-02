import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import authStore from '../store/authStore';

const AuthLayout = observer(({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = authStore;

  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated and trying to access protected pages, redirect to login
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
});

export default AuthLayout;