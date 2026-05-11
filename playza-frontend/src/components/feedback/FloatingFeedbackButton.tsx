import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdLightbulb } from 'react-icons/md';
import { FeedbackModal } from './FeedbackModal';

export const FloatingFeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[50]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="size-11 md:size-13 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center text-xl md:text-2xl border-4 border-white/20 hover:brightness-110 transition-all"
        >
          <MdLightbulb />
        </motion.button>
      </div>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
