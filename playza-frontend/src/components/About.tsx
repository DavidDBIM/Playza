import { BsFacebook, BsTwitterX, BsInstagram, BsYoutube, BsMedium } from "react-icons/bs";
import { Zap, ShieldCheck, Trophy } from "lucide-react";

const socials = [
  { icon: BsFacebook, label: "Facebook", href: "https://web.facebook.com/Playzadotgames", color: "hover:bg-[#1877F2] hover:text-white" },
  { icon: BsTwitterX, label: "X", href: "https://x.com/playzadotgames", color: "hover:bg-black hover:text-white" },
  { icon: BsInstagram, label: "Instagram", href: "https://www.instagram.com/playzadotgames", color: "hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:via-[#dc2743] hover:via-[#cc2366] hover:to-[#bc1888] hover:text-white" },
  { icon: BsMedium, label: "Medium", href: "https://medium.com/@Playzadotgames", color: "hover:bg-black hover:text-white" },
  { icon: BsYoutube, label: "YouTube", href: "https://youtube.com/@Playzadotgames", color: "hover:bg-[#FF0000] hover:text-white" },
];

const trustPoints = [
  { icon: Zap, label: "Instant Payouts" },
  { icon: ShieldCheck, label: "Fair & Secure" },
  { icon: Trophy, label: "Real Cash Prizes" },
];

const About = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <img src="/logo.webp" alt="Playza" className="h-7 md:h-9 w-auto object-contain" />
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-4 max-w-md">
        Playza is a competitive skill gaming platform where talent pays. Duel head-to-head, chase high scores
        solo, or battle it out in live tournaments — every win drops straight into your wallet, with
        real-time leaderboards keeping the arena live 24/7.
      </p>

      {/* Trust points */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {trustPoints.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-[9px] md:text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight"
          >
            <Icon className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary shrink-0" />
            <span className="truncate">{label}</span>
          </span>
        ))}
      </div>

      {/* Social */}
      <div>
        <h5 className="font-bold text-slate-900 dark:text-white mb-2 text-xs md:text-sm uppercase tracking-wide">
          Follow Us
        </h5>
        <div className="flex flex-wrap gap-2">
          {socials.map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center
                transition-all duration-300 text-slate-900 dark:text-white hover:scale-110 shadow-sm ${color}`}
            >
              <Icon className="text-base md:text-lg" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;