import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md';
import { submitFeedbackApi } from '../../api/feedback.api';

interface FeedbackFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSuccess, className = "" }) => {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [gameName, setGameName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !type) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitFeedbackApi({ type, title, message, game_name: gameName });
      
      setIsSuccess(true);
      setTitle('');
      setMessage('');
      setGameName('');
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center space-y-4 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="size-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-5xl"
        >
          <MdCheckCircle />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Feedback Received!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-bold max-w-xs mx-auto uppercase text-[10px] tracking-widest leading-relaxed">
            ✅ Thanks! We actually read every feedback.
          </p>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline pt-4"
        >
          Send another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-tight">
          <MdErrorOutline size={18} />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Type Dropdown */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Category <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-white appearance-none cursor-pointer pr-12 group-hover:bg-slate-100 dark:group-hover:bg-white/[0.08]"
            >
              <option value="" disabled>Select a Category</option>
              <option value="suggest_game">Suggest a Game</option>
              <option value="report_problem">Report a Problem</option>
              <option value="idea">Share an Idea</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a catchy title"
            className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
          />
        </div>

        {/* Optional Game Name */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Game Name <span className="opacity-50">(Optional)</span>
          </label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Which game is this about?"
            className="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700"
          />
        </div>

        {/* Message Textarea */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us more about your thoughts..."
            className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none min-h-[120px]"
          />
        </div>
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Send Feedback 🚀
          </>
        )}
      </button>
    </form>
  );
};
