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
          console.log('Push notifications enabled successfully');
        },
        onError: (err) => {
          console.error('Failed to register push token:', err);
        }
      });
    } else {
      setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-10 bg-indigo-600 text-white overflow-hidden shadow-lg"
        >
          <div className="max-w-400 mx-auto py-3 px-1.5 md:px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MdBolt className="text-xl text-yellow-300 animate-pulse" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-black uppercase tracking-tight">Don't miss the action!</p>
                <p className="text-[10px] md:text-xs font-bold text-indigo-100 opacity-80 uppercase tracking-widest">Enable notifications for challenges and rewards</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleEnable}
                className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95 whitespace-nowrap"
              >
                Enable
              </button>
              <button 
                onClick={() => setShowPrompt(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
