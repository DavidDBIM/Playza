import {
  MdAdsClick,
  MdAnalytics,
  MdCancel,
  MdCheckCircle,
  MdEmojiEvents,
  MdFavorite,
  MdGrade,
  MdHistory,
  MdLocalFireDepartment,
  MdMilitaryTech,
  MdTrendingUp,
  MdVerified,
} from "react-icons/md";
import { ZASymbol } from "@/components/currency/ZASymbol";

const Overview = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden">
      {/* Mobile Page Title */}
      <h2 className="md:hidden text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight col-span-full">
        Overview
      </h2>
      {/* <!-- Left Stats Content --> */}
      <div className="xl:col-span-2 space-y-8">
        {/* <!-- Stat Cards --> */}
        <div className="grid grid-cols-2 2xl:grid-cols-4 gap-2 md:gap-4 overflow-hidden">
          <div className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
              Total Games
            </p>
            <p className="text-xs md:text-base text-slate-900 dark:text-white  xl:text-3xl font-black">
              124
            </p>
            <div className="mt-2 text-playza-green text-[10px] flex items-center gap-1 font-black">
              <MdTrendingUp className="text-sm" /> +12% this week
            </div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
              Wins
            </p>
            <p className="text-xs md:text-base text-slate-900 dark:text-white  xl:text-3xl font-black">
              52
            </p>
            <div className="mt-2 text-playza-green text-[10px] flex items-center gap-1 font-black">
              <MdEmojiEvents className="text-sm" /> Win rate stable
            </div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
              Win Rate
            </p>
            <p className="text-xs md:text-base text-slate-900 dark:text-white  xl:text-3xl font-black">
              41%
            </p>
            <div className="mt-2 text-playza-green text-[10px] flex items-center gap-1 font-black">
              <MdAnalytics className="text-sm" /> Above average
            </div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex flex-col gap-1 hover:border-primary/40 transition-all group">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:text-primary transition-colors">
              Highest Score
            </p>
            <p className="text-xs md:text-base text-slate-900 dark:text-white  xl:text-3xl font-black">
              14,250
            </p>
            <div className="mt-2 text-playza-green text-[10px] flex items-center gap-1 font-black">
              <MdGrade className="text-sm" /> Personal Best
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Gaming Hours
              </p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black">
                342h
              </p>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-base md:text-xl">
              <MdHistory />
            </div>
          </div>
          <div className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between group hover:bg-secondary/5 transition-all">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                Tickets Won
              </p>
              <p className="text-xs md:text-base text-slate-900 dark:text-white font-black">
                12,450
              </p>
            </div>
            <div className="size-10 rounded-xl bg-playza-green/10 flex items-center justify-center text-playza-green text-base md:text-xl">
              <MdMilitaryTech />
            </div>
          </div>
        </div>

        {/* <!-- Favorite Games --> */}
        <section>
          <h3 className="text-slate-900 dark:text-white text-base md:text-xl font-black mb-3 md:mb-0 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <MdFavorite className="text-primary" />
            </div>
            Favorite Games
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 md:p-2">
            <div className="glass-card p-2 md:p-4 rounded-xl flex items-center gap-2 md:gap-5 hover:border-primary/40 transition-all cursor-pointer group shadow-lg">
              <div
                className="size-16 rounded-xl bg-cover bg-center overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform"
                data-alt="Temple Run game cover image thumbnail"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfsqo-akdTkNKEpycuZB61Vl2PFxKM7HgzSctnLLVlA0saC8hb69kCNTjFu8ZRe5FIrI09osOQOmHxEOLp74aNetIQxT5m3gMD2eUr40grD9KX6BwEI5-e7vUugHC04n1kDkEU43v6-Kf1pZuJNUvBI_y9le1Fd73gxQwvgsf3VrLdJg785TutIkg1mkxsc4c9_tu26wdP4TdlY-mWl4jxMjELWmRvhsqhgup5c7-_caZT5i0Gv9Qs8gkePYBFAwnuKEQy22poiNA9')",
                }}
              ></div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-black group-hover:text-primary transition-colors text-sm">
                  Temple Run
                </h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  48 Matches
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary text-[10px] font-black uppercase tracking-tighter bg-primary/10 px-2 py-1 rounded-md">
                  LVL 24
                </p>
              </div>
            </div>
            <div className="glass-card p-2 md:p-4 rounded-xl flex items-center gap-2 md:gap-5 hover:border-primary/40 transition-all cursor-pointer group shadow-lg">
              <div
                className="size-16 rounded-xl bg-cover bg-center overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform"
                data-alt="Candy Crush game cover art thumbnail"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrmZ6adxLAsoYEz-FxBoI4cFvoNEVS4QUin6y4dk2GH6gBMM8wcDUahZcVvTv9MCEEYjdNZND6PNm95QbwfNV_KkU-RNff_KFCWSIPfZzazEiHBxbwYjwzVpFGL1qqmyIzcR42cHMHuH8jL75SzjCShlBX9x-bycvLS-KwhTiPv6n9ySHn5CikD3mems4gfD-xOF3YSt2prcM-mGoE1OkgFUtaEJYe3IqQTXKOvokIazP3QNwl2njuj78uNBkIsgQrMTA9qty5qaOz')",
                }}
              ></div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-black group-hover:text-primary transition-colors text-sm">
                  Candy Crush
                </h4>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  76 Matches
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary text-[10px] font-black uppercase tracking-tighter bg-primary/10 px-2 py-1 rounded-md">
                  LVL 82
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- Recent Matches --> */}
        <section>
          <div className="flex items-center justify-between mb-3 md:mb-0 md:p-4">
            <h3 className="text-slate-900 dark:text-white text-base md:text-xl font-black flex items-center gap-2 md:gap-3">
              <div className="size-8 rounded-lg bg-playza-blue/20 flex items-center justify-center">
                <MdHistory className="text-playza-blue" />
              </div>
              Recent Activity
            </h3>
            <a
              className="px-2 md:px-4 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm"
              href="#"
            >
              View All
            </a>
          </div>
          <div className="space-y-3">
            {[
              {
                game: "Temple Run",
                type: "Tournament #203",
                time: "12 Minutes Ago",
                amount: "2,500",
                result: "Win",
                color: "playza-green",
              },
              {
                game: "Candy Crush",
                type: "Challenge Match",
                time: "2 Hours Ago",
                amount: "-500",
                result: "Loss",
                color: "playza-red",
              },
              {
                game: "Subway Surfers",
                type: "Sprint Mode",
                time: "Yesterday",
                amount: "1,200",
                result: "Win",
                color: "playza-green",
              },
            ].map((match, i) => (
              <div
                key={i}
                className="glass-card p-2 md:p-4 rounded-xl flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-md"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <div
                    className={`size-10 rounded-xl bg-${match.result === "Win" ? "playza-green" : "playza-red"}/10 flex items-center justify-center text-xl`}
                  >
                    {match.result === "Win" ? (
                      <MdCheckCircle className="text-playza-green text-base" />
                    ) : (
                      <MdCancel className="text-playza-red text-base" />
                    )}
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-xs md:text-sm font-black italic">
                      {match.game}{" "}
                      <span className="hidden sm:inline text-slate-500 not-italic font-bold text-xs">
                        — {match.type}
                      </span>
                    </p>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-0.5">
                      {match.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`flex items-center gap-1 justify-end text-${match.result === "Win" ? "playza-green" : "slate-500"} font-black text-base group-hover:scale-105 transition-transform`}
                  >
                    {match.amount.startsWith("-") ? "- " : "+ "}
                    <ZASymbol className="text-sm scale-90" />
                    {match.amount.replace("-", "").replace("+", "")}
                  </div>
                  <p className="text-xs md:text-base text-slate-500 text-[9px] font-bold uppercase tracking-widest opacity-60">
                    {match.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* <!-- Right Sidebar Content --> */}
      <div className="space-y-8">
        {/* <!-- Current Streak --> */}
        <div className="glass-card p-4 md:p-8 rounded-xl relative overflow-hidden text-center group shadow-2xl border-primary/20 bg-linear-to-br from-primary/10 to-transparent mb-3 dark:border-white/5">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="inline-flex size-14 rounded-xl bg-primary/20 items-center justify-center mb-3 md:mb-0 md:p-4 shadow-inner animate-pulse">
              <MdLocalFireDepartment className="text-primary text-xl md:text-3xl" />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
              Active Win Streak
            </h3>
            <p className="text-xs md:text-base text-slate-900 dark:text-white font-black mb-1 animate-in slide-in-from-bottom duration-500">
              5
            </p>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-4">
              Matches in a row
            </p>

            <div className="mt-6 flex justify-center gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`size-2 rounded-full transition-all duration-500 ${
                    i < 5
                      ? "bg-primary glow-accent scale-110"
                      : "bg-slate-300 dark:bg-slate-300/10"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* <!-- Progress Section (Rank Bar Redesign) --> */}
        <div className="glass-card p-2 md:p-6 rounded-xl shadow-xl border-primary/10 bg-linear-to-b from-primary/5 to-transparent relative overflow-hidden mb-3">
          <div className="absolute top-0 right-0 size-32 bg-primary/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-lg md:text-2xl shadow-inner border border-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                  <MdMilitaryTech />
                </div>
                <div>
                  <p className="text-xs md:text-base text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">
                    Current Rank
                  </p>
                  <h3 className="text-slate-900 dark:text-white font-black text-base md:text-xl tracking-tighter italic leading-none">
                    PLATINUM IV
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-primary text-xs font-black bg-primary/10 px-2 md:px-3 py-1 rounded-full border border-primary/20">
                  75%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/5 shadow-inner">
                <div
                  className="absolute h-full inset-y-0.5 left-0.5 bg-linear-to-r from-primary via-primary/80 to-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all duration-1000 animate-pulse"
                  style={{ width: "calc(75% - 4px)" }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider italic">
                <span className="text-slate-900 dark:text-white">
                  2,450{" "}
                  <span className="text-slate-500 not-italic font-bold">
                    XP
                  </span>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  3,000{" "}
                  <span className="text-slate-600 not-italic font-bold">
                    XP
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6 p-2 md:p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/5 backdrop-blur-sm">
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed font-bold">
                Win{" "}
                <span className="text-primary font-black uppercase tracking-tighter">
                  3 more matches
                </span>{" "}
                to reach Platinum tier and unlock exclusive rewards.
              </p>
            </div>
          </div>
        </div>

        {/* <!-- Top Achievements Preview --> */}
        <div className="glass-card p-4 md:p-8 rounded-xl shadow-xl border-slate-200 dark:border-white/5 mb-3">
          <div className="flex items-center justify-between mb-3 md:mb-0 md:p-4">
            <h3 className="text-slate-900 dark:text-white font-black text-sm md:text-lg">
              Milestones
            </h3>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
              3 / 12
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              {
                icon: <MdVerified className="text-primary" />,
                bg: "primary",
                title: "Early Adopter",
              },
              {
                icon: <MdMilitaryTech className="text-amber-500" />,
                bg: "amber-500",
                title: "Top 100",
              },
              {
                icon: <MdAdsClick className="text-playza-blue" />,
                bg: "playza-blue",
                title: "Sharpshooter",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`size-12 bg-${item.bg.split("-")[0]}/10 rounded-xl flex items-center justify-center border border-${item.bg.split("-")[0]}/20 hover:scale-110 transition-all cursor-help group relative shadow-lg`}
                title={item.title}
              >
                <span className="text-lg md:text-2xl transition-transform group-hover:rotate-12">
                  {item.icon}
                </span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
