import { BsFacebook, BsTwitterX, BsInstagram, BsYoutube, BsMedium } from "react-icons/bs";

const socials = [
  {
    icon: BsFacebook,
    label: "Facebook",
    href: "https://web.facebook.com/Playzadotgames",
    color: "hover:bg-[#1877F2] hover:text-white",
  },
  {
    icon: BsTwitterX,
    label: "X",
    href: "https://x.com/playzadotgames",
    color: "hover:bg-black hover:text-white",
  },
  {
    icon: BsInstagram,
    label: "Instagram",
    href: "https://www.instagram.com/playzadotgames",
    color: "hover:bg-gradient-to-br hover:from-[#f09433] hover:via-[#e6683c] hover:via-[#dc2743] hover:via-[#cc2366] hover:to-[#bc1888] hover:text-white",
  },
  {
    icon: BsMedium,
    label: "Medium",
    href: "https://medium.com/@Playzadotgames",
    color: "hover:bg-black hover:text-white",
  },
  {
    icon: BsYoutube,
    label: "YouTube",
    href: "https://youtube.com/@Playzadotgames",
    color: "hover:bg-[#FF0000] hover:text-white",
  },
];

const About = () => {
  return (
    <div className="glass p-2 md:p-6 rounded-xl">
      <h3 className="font-heading text-base md:text-xl font-bold text-slate-900 dark:text-white mb-4">
        About PlayZa
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
        PlayZa is leading competitive skill gaming platform. We
        believe that gaming should be rewarding. Our mission is to provide a
        secure, fair, and high-energy environment where talented players can
        turn their gaming passion into real-world profit. With real-time
        leaderboards and instant payouts, the arena is always live.
      </p>

      {/* Social */}
      <div>
        <h5 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
          Follow Us
        </h5>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {socials.map(({ icon: Icon, label, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={`w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center
                transition-all duration-300 text-slate-900 dark:text-white hover:scale-110 shadow-sm ${color}`}
            >
              <Icon className="text-base md:text-xl" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
