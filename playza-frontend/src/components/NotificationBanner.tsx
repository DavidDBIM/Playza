import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

import { useActiveBanner } from '../hooks/notifications/useNotifications';
import { useNavigate } from 'react-router';


const NotificationBanner: React.FC = () => {
  const { data: banner, isSuccess } = useActiveBanner();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive visibility: Show if we have a banner, it's not dismissed, 
  // and we haven't shown this specific ID in this session yet.
  const lastShownId = sessionStorage.getItem('last_banner_id');
  const shouldShow = isSuccess && banner && !isDismissed && lastShownId !== banner.id;

  const handleClose = () => {
    setIsDismissed(true);
    if (banner) {
      sessionStorage.setItem('last_banner_id', banner.id);
    }
  };

  const handleAction = () => {
    if (banner?.link_url) {
      // If it's a relative link (e.g. /games/chess), use navigate
      if (banner.link_url.startsWith('/')) {
        navigate(banner.link_url);
      } else {
        // If it's an external link, open in new tab or same tab
        window.open(banner.link_url, '_blank');
      }
    }
    handleClose();
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

          {/* Banner Image / Content Area */}
          <div 
            onClick={handleAction}
            className="w-full cursor-pointer overflow-hidden group"
          >
            {banner.image_url ? (
              <motion.img 
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                src={banner.image_url} 
                alt={banner.title || 'Playza Announcement'} 
                className="w-full h-full object-cover"
              />
            ) : (
              // Fallback if there's no image but somehow a banner is triggered
              <div className="p-10 text-center">
                <h3 className="text-xl font-black text-foreground">{banner.title}</h3>
                <p className="mt-2 text-muted-foreground">{banner.content}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationBanner;
