import { Link } from "react-router";
import About from "./About";

const quickLinks = [
  { label: "Games", to: "/games" },
  { label: "H2H Battles", to: "/h2h" },
  { label: "Solo Earn", to: "/solo-earn" },
  { label: "Tournaments", to: "/tournaments" },
  { label: "Leaderboards", to: "/leaderboard" },
];

const supportLinks = [
  { label: "FAQ", to: "/faq" },
  { label: "Support", to: "/support" },
  { label: "Loyalty", to: "/loyalty" },
  { label: "Referral", to: "/referral" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
];

const Footer = ({ showAbout = true }: { showAbout?: boolean }) => {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-slate-50 dark:bg-playza-dark/50 border-t border-slate-200 dark:border-white/5 pt-6 md:pt-10 pb-28 md:pb-6 overflow-hidden">
      {/* Dynamic Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 md:px-6 pb-4 md:pb-6 lg:pb-4 relative z-10">
        {showAbout && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-6 mb-6">
            <div className="lg:col-span-5">
              <About />
            </div>

            <div className="grid grid-cols-2 gap-4 lg:contents">
              <div className="lg:col-span-3">
                <h5 className="font-bold text-slate-900 dark:text-white mb-3 text-xs md:text-sm uppercase tracking-wide">
                  Quick Links
                </h5>
                <ul className="space-y-2">
                  {quickLinks.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-4">
                <h5 className="font-bold text-slate-900 dark:text-white mb-3 text-xs md:text-sm uppercase tracking-wide">
                  Support
                </h5>
                <ul className="space-y-2">
                  {supportLinks.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 mb-0.5">
              <img src="/logo.webp" alt="Playza" className="h-6 md:h-7 w-auto object-contain" />
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic opacity-80">
                © {year} PlayZa Arena
              </p>
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              The World's Premier Skill Gaming Ecosystem. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-6 gap-y-1.5">
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/terms">Terms & Conditions</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/privacy">Privacy Policy</Link>
            <Link className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" to="/faq">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;