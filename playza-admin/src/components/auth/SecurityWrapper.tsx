import React, { useEffect } from 'react';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';
import { useNavigate } from 'react-router';
import { authService } from '../../services/auth.service';

const ABSOLUTE_EXPIRY_HOURS = 4;

export const SecurityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  // 1. Idle Timeout (15 minutes)
  useIdleTimeout(15);

  // 2. Absolute Session Expiry (4 Hours)
  useEffect(() => {
    const checkAbsoluteExpiry = () => {
      const loginTime = localStorage.getItem('admin_login_time');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        if (elapsed > ABSOLUTE_EXPIRY_HOURS * 60 * 60 * 1000) {
          console.log("[SECURITY] Absolute session limit reached. Re-authentication required.");
          authService.logout();
          navigate("/signin");
        }
      }
    };

    const interval = setInterval(checkAbsoluteExpiry, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [navigate]);

  return <>{children}</>;
};
