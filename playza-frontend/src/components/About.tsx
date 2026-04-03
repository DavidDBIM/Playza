import { BsDiscord, BsFacebook, BsTwitterX } from "react-icons/bs";

const About = () => {
  return (
    <div className="glass p-2 md:p-6 rounded-xl">
      <h3 className="font-heading text-base md:text-xl font-bold text-slate-900 dark:text-white mb-4">
        About PlayZa
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
        PlayZa is Nigeria's leading competitive skill gaming platform. We
        believe that gaming should be rewarding. Our mission is to provide a
        secure, fair, and high-energy environment where talented players can
        turn their gaming passion into real-world profit. With real-time
        leaderboards and instant payouts, the arena is always live.
      </p>
      {/* Social */}
      <div>
        <h5 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wide">
          Follow Us
        </h5>
        <div className="flex gap-2 md:gap-4">
          {[BsDiscord, BsFacebook, BsTwitterX].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center
                        hover:bg-primary transition-all duration-300 text-slate-900 dark:text-white
                        hover:scale-110"
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
