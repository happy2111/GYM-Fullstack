import React, {useEffect} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import authStore from '../store/authStore';

const AuthLayout = observer(({ children }) => {
  const location = useLocation();
  const { isAuthenticated,  isLoading} = authStore;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (location.pathname === '/auth/google/callback') {
    return <>{children}</>;
  }

  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
});

export default AuthLayout;