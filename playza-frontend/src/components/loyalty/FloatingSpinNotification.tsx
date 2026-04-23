import { useLoyaltyMe } from "@/hooks/loyalty/useLoyaltyMe";
import { useAuth } from "@/context/auth";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

export const FloatingSpinNotification = () => {
  const { user } = useAuth();
  const { data: loyaltyData } = useLoyaltyMe();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show on home page
  if (location.pathname !== "/") return null;
  
  // Only show if logged in and has spins left
  const spinsLeft = loyaltyData?.spins_left_today ?? 0;
  if (!user || spinsLeft <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/loyalty?spin=true")}
        className="fixed bottom-24 right-2 md:bottom-12 md:right-12 z-40 cursor-pointer group"
      >
        <div className="relative">
          {/* Animated rings */}
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse scale-150" />
          
          {/* Main Button */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-br from-indigo-600/20 to-purple-700/20 shadow-xl shadow-indigo-500/40 flex items-center justify-center border-2 border-white/10 overflow-hidden group backdrop-blur-sm">
            <img 
              src="/lucky_wheel_asset.png" 
              alt="Spin Wheel" 
              className="w-full h-full object-contain animate-spin-slow group-hover:scale-110 transition-transform p-1"
            />
            
            {/* Spin Count Badge */}
            <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center shadow-md z-10">
              <span className="text-white text-[8px] font-black leading-none">{spinsLeft}</span>
            </div>
          </div>

          {/* Tooltip/Label */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
            <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
              Spins Ready!
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
