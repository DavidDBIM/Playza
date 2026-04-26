import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdBolt, MdClose } from 'react-icons/md';
import { useAuth } from '../context/auth';

import { useRegisterPush } from '../hooks/notifications/useNotifications';

const NotificationPrompt: React.FC = () => {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const registerPush = useRegisterPush();

  useEffect(() => {
    // Don't show if already dismissed on this device
    const dismissed = localStorage.getItem('playza_notifications_prompt_dismissed');
    if (dismissed) return;

    // Only show to logged in users who haven't decided on notifications yet
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleEnable = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const mockToken = `web_push_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      
      registerPush.mutate({ 
        token: mockToken, 
        deviceType: 'web' 
      }, {
        onSuccess: () => {
          setShowPrompt(false);
          // Mark as dismissed so it doesn't show again
          localStorage.setItem('playza_notifications_prompt_dismissed', 'true');
          console.log('Push notifications enabled successfully');
        },
        onError: (err) => {
          console.error('Failed to register push token:', err);
        }
      });
    } else {
      setShowPrompt(false);
      // Even if they deny, we might want to respect their choice for the session
      localStorage.setItem('playza_notifications_prompt_dismissed', 'true');
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('playza_notifications_prompt_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-10 bg-indigo-600 text-white overflow-hidden shadow-lg border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto py-1.5 md:py-3 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-white/20 p-1 md:p-2 rounded-lg shrink-0">
                <MdBolt className="text-sm md:text-xl text-yellow-300 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-sm font-black uppercase tracking-tight truncate">Don't miss the action!</p>
                <p className="hidden md:block text-[10px] md:text-xs font-bold text-indigo-100 opacity-80 uppercase tracking-widest truncate">Enable notifications for challenges and rewards</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <button 
                onClick={handleEnable}
                className="bg-white text-indigo-600 px-3 md:px-6 py-1 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Enable
              </button>
              <button 
                onClick={handleClose}
                className="p-1 md:p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close notification prompt"
              >
                <MdClose size={16} className="md:size-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
