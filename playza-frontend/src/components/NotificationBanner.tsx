import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

import { useActiveBanner } from '../hooks/notifications/useNotifications';

const NotificationBanner: React.FC = () => {
  const { data: banner, isSuccess } = useActiveBanner();
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive visibility: Show if we have a banner, it's not dismissed, 
  // and we haven't shown this specific ID in this session yet.
  const lastShownId = sessionStorage.getItem('last_banner_id');
  const shouldShow = isSuccess && banner && !isDismissed && lastShownId !== banner.id;

  // When the user closes the banner, we mark it as dismissed and update storage
  const handleClose = () => {
    setIsDismissed(true);
    if (banner) {
      sessionStorage.setItem('last_banner_id', banner.id);
    }
  };

  if (!shouldShow || !banner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-white/10"
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors"
          >
            <IoClose size={24} />
          </button>

          {/* Banner Image */}
          {banner.image_url && (
            <div className="w-full aspect-video overflow-hidden">
              <img 
                src={banner.image_url} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Action Button */}
          <div className="p-5">
            <button 
              onClick={handleClose}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              Let's Play
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationBanner;
