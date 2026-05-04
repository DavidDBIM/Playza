import React from 'react';
import { Navigate, Outlet } from 'react-router';

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('admin_token');
  const user = localStorage.getItem('admin_user');
  const loginTime = localStorage.getItem('admin_login_time');

  // No token at all — go to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Has token but no user record — clear and go to signin
  if (!user) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_login_time');
    return <Navigate to="/signin" replace />;
  }

  // Check role is valid admin role
  try {
    const parsed = JSON.parse(user);
    if (parsed.role && parsed.role !== 'admin' && parsed.role !== 'superadmin') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_login_time');
      return <Navigate to="/signin" replace />;
    }
  } catch {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_login_time');
    return <Navigate to="/signin" replace />;
  }

  // Absolute expiry check (4 hours) — also done in SecurityWrapper
  // but we do it here too to catch it before render
  if (loginTime) {
    const elapsed = Date.now() - parseInt(loginTime);
    const FOUR_HOURS = 4 * 60 * 60 * 1000;
    if (elapsed > FOUR_HOURS) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_login_time');
      return <Navigate to="/signin" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
