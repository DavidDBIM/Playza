import { Link } from "react-router";
import About from "./About";

const Footer = ({ showAbout = true }: { showAbout?: boolean }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-slate-50 dark:bg-playza-dark/50 border-t border-slate-200 dark:border-white/5 pt-2 md:pt-3 pb-16 md:pb-4 overflow-hidden">
      {/* Dynamic Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-2 md:px-6 pb-2 md:pb-4 lg:pb-2">
        {showAbout && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 md:gap-6 mb-3">
            <div className="lg:col-span-6">
              <About />
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-2 md:pt-4 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4 relative z-10">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 mb-0.5">
              <img src="/logo.webp" alt="Playza" className="h-6 md:h-7 w-auto object-contain" />
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic opacity-80">
                © {year} PlayZa Arena
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Nigeria's Premium Skill Gaming Ecosystem. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-1.5">
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/terms">Terms & Conditions</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/privacy">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
