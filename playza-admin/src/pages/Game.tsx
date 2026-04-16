import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MdEdit, 
  MdRocketLaunch, 
  MdCategory, 
  MdCalendarToday, 
  MdStadium, 
  MdInfo, 
  MdGavel, 
  MdAdd, 
  MdSchedule, 
  MdEvent, 
  MdTrendingUp, 
  MdArrowForward, 
  MdLightbulb,
  MdBarChart,
  MdHistory,
  MdShield
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { games } from '../data/gamesData';

const Game: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sessions' | 'about' | 'rules'>('sessions');

  const game = useMemo(() => {
    return games.find(g => g.slug === slug);
  }, [slug]);

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-slate-900 dark:text-white min-h-[50vh]">
        <h2 className="text-2xl font-black text-primary">Game Not Found</h2>
        <p className="text-slate-500 mt-2 font-medium">The requested game details could not be found.</p>
        <Button onClick={() => navigate('/games')} className="mt-4 bg-primary text-white rounded-xl shadow-lg hover:brightness-110 uppercase tracking-widest text-[10px] font-black px-6">Back to Games</Button>
      </div>
    );
  }

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-10 max-w-350">
      {/* Game Header Section */}
      <section className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10 glass-card p-6 md:p-8 rounded-3xl group overflow-hidden border border-slate-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/20 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-[2rem] border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-2xl relative group/img shrink-0">
            <img 
              src={game.thumbnail} 
              alt={game.title} 
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="text-center sm:text-left pt-1">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{game.title}</h2>
              <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border shadow-sm ${
                game.isActive 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${game.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}></span>
                {game.isActive ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs md:text-sm">
              <span className="flex items-center gap-1.5"><MdCategory className="text-primary" /> {game.category} • {game.mode}</span>
              <span className="flex items-center gap-1.5"><MdCalendarToday className="text-primary" /> Created {new Date(game.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto mt-4 lg:mt-0 relative z-10">
          <Button onClick={() => navigate('/games/create')} variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
            <MdEdit className="text-lg" /> Quick Edit
          </Button>
          <Button onClick={() => navigate(`/sessions/PX-992-ALPHA`)} className="flex-1 lg:flex-none h-12 bg-linear-to-r from-primary via-emerald-500 to-sky-500 text-white hover:from-primary hover:to-emerald-400 rounded-xl font-black shadow-xl shadow-primary/30 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group">
            <MdRocketLaunch className="text-lg group-hover:-translate-y-1 transition-transform" /> Launch Game
          </Button>
        </div>
      </section>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Primary Tabs & Content */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          <div className="flex mb-8 overflow-x-auto no-scrollbar scrollbar-hide">
            <div className="inline-flex p-1.5 bg-slate-100/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
              <button 
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${activeTab === 'sessions' ? 'text-primary bg-white dark:bg-[#1a1c22] shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <MdStadium className={activeTab === 'sessions' ? 'text-primary' : 'text-slate-400'} /> Sessions
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${activeTab === 'about' ? 'text-primary bg-white dark:bg-[#1a1c22] shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <MdInfo className={activeTab === 'about' ? 'text-primary' : 'text-slate-400'} /> About
              </button>
              <button 
                onClick={() => setActiveTab('rules')}
                className={`flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap ${activeTab === 'rules' ? 'text-primary bg-white dark:bg-[#1a1c22] shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <MdGavel className={activeTab === 'rules' ? 'text-primary' : 'text-slate-400'} /> Rules
              </button>
            </div>
          </div>

          {activeTab === 'sessions' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Match Sessions</h3>
                <Button size="sm" variant="outline" className="border-slate-200 dark:border-white/10 text-primary hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]">
                  <MdAdd /> Create Session
                </Button>
              </div>

              {/* Session Card 1: Live (Demo) */}
              <div 
                className="glass-card p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm hover:shadow-lg cursor-pointer bg-white/50 dark:bg-transparent"
                onClick={() => navigate('/sessions/ALPHA-992')}
              >
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-3xl shadow-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Live
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Qualifier Rank</p>
                    <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Regional Qualifiers #12</h4>
                    <div className="flex flex-wrap items-center gap-6 mt-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Prize Pool</span>
                        <span className="text-lg md:text-2xl font-black text-primary drop-shadow-sm">₦500k+</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Players</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">45 <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/ 100</span></span>
                          <div className="w-24 md:w-32 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
                            <div className="w-[45%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-4 mt-2 md:mt-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                      <MdSchedule className="text-primary text-sm" /> Started 15m ago
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl shrink-0 border-slate-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}><MdEdit /></Button>
                      <Button className="flex-1 md:flex-none px-6 h-10 md:h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">View Analytics</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Card 2: Upcoming (Demo) */}
              <div 
                className="glass-card p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-primary/30 transition-all group opacity-80 hover:opacity-100 shadow-sm cursor-pointer bg-white/50 dark:bg-transparent"
                onClick={() => navigate('/sessions/STORM-443')}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Global Series</p>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Upcoming</span>
                    </div>
                    <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Midnight Storm Championship</h4>
                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Estimated Pool</span>
                        <span className="text-lg md:text-2xl font-black text-primary drop-shadow-sm">₦2.5M+</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Reservations</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">12 <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/ 256</span></span>
                          <div className="w-24 md:w-32 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden shrink-0">
                            <div className="w-[5%] h-full bg-amber-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-4 mt-2 md:mt-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                      <MdEvent className="text-amber-500 text-sm" /> Starts in 4h 20m
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-2xl shrink-0 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5" onClick={(e) => e.stopPropagation()}><MdEdit /></Button>
                      <Button variant="outline" className="flex-1 md:flex-none px-6 h-10 md:h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 shadow-sm">Manage Roster</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6 text-slate-900 dark:text-white">About Game</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
                  {game.title} is a high-stakes competitive experience designed for the platform. 
                  Engineered with a robust matchmaking system, it offers a seamless competitive environment 
                  where verified players compete in ranked tournaments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-5 md:p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <MdBarChart className="text-primary text-2xl md:text-3xl shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Duration</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{game.durationInSeconds} Seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 md:p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <MdHistory className="text-primary text-2xl md:text-3xl shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Platform Fee</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{game.platformFeePercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white/50 dark:bg-transparent">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdShield className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Integrity</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Anti-Cheat Enabled</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white/50 dark:bg-transparent">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdTrendingUp className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Growth</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">+12% Monthly Engagement</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center bg-white/50 dark:bg-transparent">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdRocketLaunch className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Platform Engine</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Playza Native Support</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3 text-slate-900 dark:text-white">
                  <MdGavel className="text-primary" /> Rules & Guidelines
                </h3>
                <div className="space-y-6">
                  {[
                    "Fair Play Protocol: Any manipulation of game memory or network packets results in immediate ban.",
                    "Session Integrity: Players must remain connected for at least 80% of the session to qualify for prizes.",
                    "Ranking Weights: Elo ratings are calculated using the platform's v4 algorithm.",
                    "Prize Escrow: All funds are held in secure escrow until session validation is complete."
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-5 group">
                      <span className="text-primary font-black italic text-lg opacity-50 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed tracking-wide border-l-2 border-primary/20 pl-5">{rule}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-10 h-12 border-slate-200 dark:border-white/10 text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]">
                  Download Ruleset Document
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="col-span-1 lg:col-span-4 space-y-8">
          <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-white/50 dark:bg-transparent">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <MdTrendingUp className="text-primary text-lg" /> Performance Pulse
            </h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">Revenue (Last 7 Days)</span>
                  <span className="text-emerald-500 font-black text-[10px] flex items-center gap-1">
                    <MdTrendingUp /> +12.4%
                  </span>
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₦12.4M</div>
                <div className="h-16 w-full mt-6 flex items-end gap-1.5 opacity-70">
                  {['h-[40%]', 'h-[60%]', 'h-[55%]', 'h-[80%]', 'h-[70%]', 'h-[90%]', 'h-full'].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-all duration-500 ${i === 6 ? 'bg-primary' : 'bg-primary/20 dark:bg-primary/40'} ${h}`} 
                    ></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block mb-1">Avg Vol</span>
                  <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white">42m</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest block mb-1">Engaged</span>
                  <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{game.activePlayers}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 h-12 rounded-xl border-slate-200 dark:border-white/10 text-primary hover:bg-slate-50 dark:hover:bg-white/5 font-black uppercase tracking-widest text-[10px] transition-all group">
              Full Analytics Report
              <MdArrowForward className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm bg-white/50 dark:bg-transparent">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">System Diagnostics</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500 dark:text-slate-400">Node Status</span>
                <span className="text-emerald-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Ping Rate</span>
                <span className="text-slate-900 dark:text-white font-mono">12ms</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-500/10 dark:bg-amber-500/5 rounded-[2rem] border border-amber-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <MdLightbulb className="text-6xl text-amber-500" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic relative z-10">
              "Note: Distribution logic for the Midnight Storm Championship requires a routine review before the 04:00 register window starts."
            </p>
            <div className="mt-5 flex items-center gap-2 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              <MdLightbulb className="text-sm" /> Admin Notice
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Game;
