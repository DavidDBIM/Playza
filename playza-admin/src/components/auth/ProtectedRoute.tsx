import React from 'react';
import { Navigate, Outlet } from 'react-router';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
