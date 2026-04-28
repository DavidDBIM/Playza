import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdThumbUp, MdThumbDown, MdSend, MdCheckCircle } from 'react-icons/md';
import { submitFeedbackApi } from '../../api/feedback.api';

interface QuickFeedbackProps {
  gameName: string;
}

export const QuickFeedback: React.FC<QuickFeedbackProps> = ({ gameName }) => {
  const [step, setStep] = useState<'initial' | 'message' | 'success'>('initial');
  const [enjoyed, setEnjoyed] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInitialChoice = (choice: boolean) => {
    setEnjoyed(choice);
    setStep('message');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitFeedbackApi({ 
        type: 'game_feedback', 
        title: `Feedback for ${gameName}`, 
        message: `${enjoyed ? '👍 Enjoyed' : '👎 Did not enjoy'}. ${message}`,
        game_name: gameName
      });
      setStep('success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mt-6 pt-6 border-t border-white/5">
      <AnimatePresence mode="wait">
        {step === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Did you enjoy this game?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleInitialChoice(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <MdThumbUp size={16} />
                Yes
              </button>
              <button
                onClick={() => handleInitialChoice(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <MdThumbDown size={16} />
                No
              </button>
            </div>
          </motion.div>
        )}

        {step === 'message' && (
          <motion.div
            key="message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-3"
          >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">
              What would make it better?
            </p>
            <div className="relative">
              <textarea
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts (optional)..."
                className="w-full p-4 bg-slate-950/50 border border-white/10 rounded-xl text-xs font-medium text-white placeholder:text-slate-700 resize-none h-24 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="absolute bottom-3 right-3 size-10 bg-primary text-white rounded-lg flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <MdSend size={18} />
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-2"
          >
            <MdCheckCircle className="text-emerald-500 text-2xl" />
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Thanks for the feedback!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
