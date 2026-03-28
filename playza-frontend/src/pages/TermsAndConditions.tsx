import { useEffect } from "react";
import { Link } from "react-router";

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-2 md:py-12 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-12 text-center animate-fade-in px-2">
        <h1 className="text-2xl md:text-5xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-linear-to-r from-primary to-accent mb-2 md:mb-4">
          Terms & Conditions
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] md:text-sm">
          Last Updated: March 17, 2026
        </p>
      </div>

      <div className="glass-card rounded-2xl md:rounded-xl p-5 md:p-10 space-y-8 md:space-y-12 shadow-2xl border border-white/5 relative overflow-hidden">
        {/* Subtle Decorative Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />

        <section className="relative z-10">
          <p className="text-sm md:text-xs md:text-base leading-relaxed mb-4 md:mb-6">
            Welcome to <span className="text-primary font-bold">PLAYZA</span>. These Terms and Conditions (“Terms”) govern your access to and use of the PLAYZA platform, including our website, mobile applications, and any related services (collectively, the “Platform”).
          </p>
          <p className="text-sm md:text-xs md:text-base leading-relaxed">
            By creating an account or participating in any game on the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Platform.
          </p>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Introduction
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-xs md:text-base">
              PLAYZA is an online competitive gaming platform built for skill-based challenges.
            </p>
            <ul className="list-disc pl-2 md:pl-6 space-y-2">
              <li><span className="text-foreground font-bold">Skill-Based Nature:</span> All games on PLAYZA are time-sensitive and performance-based. Players compete using their knowledge, speed, and accuracy to secure positions on a leaderboard.</li>
              <li><span className="text-foreground font-bold">Competition Mechanics:</span> Players purchase digital tickets to gain entry into specific game rounds.</li>
              <li><span className="text-foreground font-bold">Leaderboard & Rewards:</span> A player’s score determines their ranking on the live leaderboard. The total ticket pool collected from participants (less applicable platform fees) is awarded as a prize to the highest-ranking player(s) at the conclusion of the game period.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Definitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {[
              { term: "User / You", def: "Any individual who registers an account and uses the Platform." },
              { term: "Za", def: "The proprietary virtual currency used within the PLAYZA ecosystem." },
              { term: "Ticket", def: "A digital entry pass purchased using Za to enter a specific game round." },
              { term: "Prize Pool", def: "The total value of Za contributed by participants in a game round, intended for distribution to winners." },
              { term: "We / Us / Our", def: "Reference to PLAYZA is reference to playza.io corporate entities." },
              { term: "Fiat", def: "Government-issued currency (e.g., Nigerian Naira)." }
            ].map((item, i) => (
              <div key={i} className="bg-muted/30 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                <p className="font-black text-foreground uppercase text-xs tracking-widest mb-1">{item.term}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{item.def}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Eligibility
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-xs md:text-base">To use PLAYZA, you represent and warrant that:</p>
            <ol className="list-decimal pl-2 md:pl-6 space-y-2 font-medium">
              <li>You are at least 13 years of age. Users under 18 must have parental or guardian consent.</li>
              <li>You are a resident of Nigeria or a jurisdiction where skill-based gaming is not prohibited by law.</li>
              <li>You have the legal capacity to enter into a binding contract.</li>
              <li>You have not been previously suspended or removed from the Platform.</li>
            </ol>
          </div>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            User Accounts & Security
          </h2>
          <ul className="list-disc pl-5 md:pl-6 space-y-2 md:space-y-4 text-xs md:text-sm text-muted-foreground">
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Registration:</span> You must provide accurate and complete information when creating an account.</li>
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Account Responsibility:</span> You are solely responsible for maintaining the confidentiality of your login credentials. All activities occurring under your account are your responsibility.</li>
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">One Account Per Person:</span> Users are prohibited from maintaining more than one account. Multi-accounting to manipulate leaderboards will result in a permanent ban.</li>
          </ul>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Acceptable Use Policy
          </h2>
          <div className="bg-red-500/5 border border-red-500/10 p-5 md:p-6 rounded-2xl md:rounded-xl">
            <p className="font-bold text-red-500 mb-3 md:mb-4 tracking-tighter uppercase italic text-xs md:text-sm">You agree NOT to engage in any of the following prohibited activities:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-4 text-[10px] md:text-sm text-muted-foreground pl-2 md:pl-4 border-l-2 border-red-500/20">
              <li><span className="text-foreground font-bold mr-1">Cheating:</span> Bots, scripts, or automated software.</li>
              <li><span className="text-foreground font-bold mr-1">Abuse:</span> Harassing or bullying other users.</li>
              <li><span className="text-foreground font-bold mr-1">Collusion:</span> Coordinating to manipulate outcomes.</li>
              <li><span className="text-foreground font-bold mr-1">Platform Integrity:</span> Attempting to hack or disrupt servers.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Gameplay Rules
          </h2>
          <ul className="list-disc pl-2 md:pl-6 space-y-4 text-muted-foreground">
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Entry Requirements:</span> Access to any game round requires the purchase of a Ticket using ZA.</li>
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Variable Pricing:</span> Ticket prices vary depending on the game, category, and Prize Pool.</li>
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Non-Refundable Policy:</span> Once a Ticket is purchased, the transaction is final. Tickets are committed to the live Prize Pool immediately.</li>
            <li><span className="text-foreground font-bold italic tracking-tight uppercase text-xs">Winning:</span> Highest verified score at the end of the period is the winner.</li>
          </ul>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Deposit and Withdrawal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <p className="text-foreground font-bold italic tracking-tight uppercase text-xs">Currency Conversion</p>
              <p className="text-xs md:text-sm text-muted-foreground">Fiat currency is converted to ZA at rates displayed during purchase.</p>
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-bold italic tracking-tight uppercase text-xs">Withdrawals</p>
              <p className="text-xs md:text-sm text-muted-foreground">Users can convert ZA back to Fiat, subject to verification processing.</p>
            </div>
            <div className="space-y-2">
              <p className="text-foreground font-bold italic tracking-tight uppercase text-xs">Fees</p>
              <p className="text-xs md:text-sm text-muted-foreground">0.5% withdrawal fee and 30% ticket prize fee apply for administrative costs.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Suspension & Termination
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            PLAYZA may suspend or terminate accounts for breaching terms, suspected fraudulent activity, or legal requirements. Upon termination, ZA obtained through unfair play is forfeited.
          </p>
        </section>

        <section className="space-y-4 md:space-y-6 relative z-10">
          <h2 className="text-base md:text-xl font-black uppercase italic tracking-tight text-primary flex items-center gap-2 md:gap-3">
            <span className="w-6 md:w-8 h-1 bg-primary rounded-full" />
            Contact & Legal
          </h2>
          <div className="bg-muted/50 p-4 md:p-6 rounded-2xl md:rounded-xl space-y-3 md:space-y-4">
            <p className="text-xs md:text-sm text-muted-foreground italic">
              Governing Law: Fed. Republic of Nigeria. For full details or questions, reach out to our team.
            </p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="bg-background/80 p-3 md:p-4 rounded-xl md:rounded-2xl flex-1 border border-white/5">
                <p className="text-[10px] uppercase font-black text-primary mb-1">Support Email</p>
                <p className="text-xs md:text-sm font-bold">Support@Playza.com</p>
              </div>
              <div className="bg-background/80 p-2 md:p-4 rounded-2xl flex-1 border border-white/5">
                <p className="text-[10px] uppercase font-black text-primary mb-1">Office</p>
                <p className="text-xs md:text-sm font-bold">Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-2 md:pt-8 border-t border-white/5 text-center relative z-10">
          <Link to="/" className="text-primary hover:text-primary/80 font-bold transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
