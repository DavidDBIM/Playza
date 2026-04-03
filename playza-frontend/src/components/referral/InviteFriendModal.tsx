import { MdClose, MdContentCopy } from "react-icons/md";
import { FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { useState, useEffect } from "react";

interface InviteFriendModalProps {
  onClose: () => void;
  referralLink: string;
}

const InviteFriendModal = ({ onClose, referralLink }: InviteFriendModalProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent("Join me on Playza! Get a 20% discount on your first tournament entries using my link: ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-background/80">
      <div className="glass-card w-full max-w-md rounded-xl p-2 md:p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 md:hover:text-slate-900 md:dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-xl p-2"
        >
          <MdClose className="text-base md:text-xl" />
        </button>

        <div className="text-center mb-6 mt-2">
          <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 italic tracking-tight">Share the love</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
            Invite your friends and earn rewards for every successful referral.
          </p>
        </div>

        <div className="mb-6">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
            Your Referral Link
          </label>
          <div className="flex bg-slate-50 dark:bg-background border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="flex-1 bg-transparent px-2 md:px-4 py-2 md:py-3 text-sm text-slate-900 dark:text-slate-200 outline-none font-bold"
            />
            <button 
              onClick={handleCopy}
              className="bg-primary/10 text-primary px-2 md:px-4 font-black uppercase tracking-widest text-xs md:hover:bg-primary/20 flex items-center gap-2"
            >
              <MdContentCopy /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">
            Share via social
          </label>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <a 
              href={`https://wa.me/?text=${shareText}${referralLink}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 md:hover:bg-[#25D366]/10 md:dark:hover:bg-[#25D366]/20 border border-slate-100 dark:border-white/5 md:hover:border-[#25D366]/30 text-[#25D366] rounded-xl p-2 md:p-4 group"
            >
              <FaWhatsapp className="text-lg md:text-2xl md:group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">WhatsApp</span>
            </a>
            
            <a 
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${referralLink}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 md:hover:bg-slate-900/10 md:dark:hover:bg-[#1DA1F2]/20 border border-slate-100 dark:border-white/5 md:hover:border-slate-900/20 md:dark:hover:border-[#1DA1F2]/30 text-slate-900 dark:text-[#1DA1F2] rounded-xl p-2 md:p-4 group"
            >
              <FaTwitter className="text-lg md:text-2xl md:group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Twitter</span>
            </a>
            
            <a 
              href={`https://t.me/share/url?url=${referralLink}&text=${shareText}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 md:hover:bg-[#0088cc]/10 md:dark:hover:bg-[#0088cc]/20 border border-slate-100 dark:border-white/5 md:hover:border-[#0088cc]/30 text-[#0088cc] rounded-xl p-2 md:p-4 group"
            >
              <FaTelegram className="text-lg md:text-2xl md:group-hover:scale-110" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendModal;
