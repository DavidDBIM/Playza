import {  useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router';

export const useIdleTimeout = (timeoutMinutes: number = 15) => {
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    console.log("[SECURITY] Idle timeout reached. Terminating session...");
    authService.logout();
    navigate("/signin");
  }, [navigate]);

  useEffect(() => {
    let timeoutId: number;

    const setupTimeout = () => {
      timeoutId = setTimeout(handleLogout, timeoutMinutes * 60 * 1000);
    };

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setupTimeout();
    };

    // Events to track activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Initial setup
    setupTimeout();

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimeout);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMinutes, handleLogout]);
};
