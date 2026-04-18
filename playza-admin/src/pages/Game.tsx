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
    <main className="p-6 space-y-6">
      {/* Game Header Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl border border-border overflow-hidden bg-muted p-1">
            <img 
              src={game.thumbnail} 
              alt={game.title} 
              className="w-full h-full object-cover rounded-xl" 
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">{game.title}</h1>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm flex items-center gap-1.5 ${
                game.isActive 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-500/20' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${game.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`}></span>
                {game.isActive ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><MdCategory className="text-primary" /> {game.category} • {game.mode}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><MdCalendarToday className="text-primary" /> {new Date(game.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/games/create')} className="px-5 py-2.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-foreground transition-all">
            <MdEdit className="text-lg mr-2 inline" /> Edit
          </button>
          <button onClick={() => navigate(`/sessions/PX-992-ALPHA`)} className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center gap-2">
            <MdRocketLaunch className="text-lg" /> Launch Game
          </button>
        </div>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        {/* Primary Tabs & Content */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          <div className="flex items-center p-1 bg-muted/50 rounded-xl border border-border grow-0 w-fit">
            {([
              { id: 'sessions', label: 'Sessions', icon: MdStadium },
              { id: 'about', label: 'About', icon: MdInfo },
              { id: 'rules', label: 'Rules', icon: MdGavel }
            ] as const).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${activeTab === tab.id ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <tab.icon className="text-lg" /> {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'sessions' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Active Match Sessions</h3>
                <button className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border">
                  <MdAdd className="text-lg mr-1 inline" /> Create
                </button>
              </div>

              {/* Session Card 1: Live (Demo) */}
              <div 
                className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-all group relative overflow-hidden shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => navigate('/sessions/ALPHA-992')}
              >
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest rounded-bl-xl shadow-lg flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                  Live
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Qualifier Rank</p>
                      <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Regional Qualifiers #12</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Prize Pool</span>
                        <span className="text-xl font-black text-primary font-number tracking-tight">₦500,000+</span>
                      </div>
                      <div className="flex flex-col flex-1 max-w-48">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Players</span>
                          <span className="text-[10px] font-black text-foreground font-number">45 / 100</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="w-[45%] h-full bg-emerald-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border">
                      <MdSchedule className="text-primary text-sm" /> 15m ago
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="h-9 w-9 bg-muted hover:bg-muted/80 text-foreground rounded-xl flex items-center justify-center transition-all border border-border" onClick={(e) => e.stopPropagation()}><MdEdit /></button>
                      <button className="px-4 h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/20 transition-all">Analytics</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Card 2: Upcoming (Demo) */}
              <div 
                className="bg-card p-6 rounded-2xl border border-border hover:border-primary/50 transition-all group opacity-80 hover:opacity-100 shadow-sm cursor-pointer"
                onClick={() => navigate('/sessions/STORM-443')}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                       <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Global Series</p>
                       <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded border border-amber-500/20">Upcoming</span>
                    </div>
                    <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Midnight Storm Championship</h4>
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Estimated Pool</span>
                        <span className="text-xl font-black text-primary font-number tracking-tight">₦2,500,000+</span>
                      </div>
                      <div className="flex flex-col flex-1 max-w-48">
                         <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Reservations</span>
                          <span className="text-[10px] font-black text-foreground font-number">12 / 256</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="w-[5%] h-full bg-amber-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border">
                      <MdEvent className="text-amber-500 text-sm" /> 4h 20m
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="h-9 w-9 bg-muted hover:bg-muted/80 text-foreground rounded-xl flex items-center justify-center transition-all border border-border" onClick={(e) => e.stopPropagation()}><MdEdit /></button>
                      <button className="px-4 h-9 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-border">Roster</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}              {activeTab === 'about' && (
            <div className="animate-in fade-in duration-500 space-y-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-foreground">Game Definition</h3>
                <p className="text-muted-foreground leading-relaxed text-sm font-medium mb-6">
                  {game.title} is a high-stakes competitive experience designed for the platform. 
                  Engineered with a robust matchmaking system, it offers a seamless competitive environment 
                  where verified players compete in ranked tournaments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <MdBarChart className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-0.5">Duration</h4>
                      <p className="text-xs text-muted-foreground font-black font-number uppercase tracking-tight">{game.durationInSeconds} Seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <MdHistory className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-0.5">Platform Fee</h4>
                      <p className="text-xs text-muted-foreground font-black font-number uppercase tracking-tight">{game.platformFeePercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: MdShield, label: "Integrity", sub: "Anti-Cheat Enabled" },
                  { icon: MdTrendingUp, label: "Growth", sub: "+12% Engagement" },
                  { icon: MdRocketLaunch, label: "Engine", sub: "Playza Native" }
                ].map((item, i) => (
                  <div key={i} className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <item.icon className="text-primary text-lg" />
                    </div>
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-1">{item.label}</h4>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="animate-in fade-in duration-500">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground">
                  <MdGavel className="text-primary" /> Rules & Guidelines
                </h3>
                <div className="space-y-4">
                  {[
                    "Fair Play Protocol: Any manipulation of game memory results in immediate ban.",
                    "Session Integrity: Players must remain connected for at least 80% to qualify.",
                    "Ranking Weights: Elo ratings are calculated using the platform's v4 algorithm.",
                    "Prize Escrow: Funds are held in escrow until session validation is complete."
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-primary font-black italic text-lg opacity-50 font-number">0{i+1}</span>
                      <p className="text-xs font-bold text-muted-foreground leading-relaxed border-l border-border pl-4">{rule}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 h-10 bg-muted hover:bg-muted/80 text-primary rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                  Download Ruleset Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-muted-foreground">
              <MdTrendingUp className="text-primary text-lg" /> Performance Pulse
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Revenue (7D)</span>
                  <span className="text-emerald-500 font-black text-[9px] flex items-center gap-1 font-number">
                    <MdTrendingUp /> +12.4%
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground font-number tracking-tighter">₦12.4M</div>
                <div className="h-12 w-full mt-4 flex items-end gap-1 opacity-60">
                  {[0.4, 0.6, 0.55, 0.8, 0.7, 0.9, 1].map((h, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${h * 100}%` }}
                      className={`flex-1 rounded-sm transition-all duration-500 ${i === 6 ? 'bg-primary' : 'bg-primary/20'}`} 
                    ></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">Avg Vol</span>
                  <span className="text-lg font-black text-foreground font-number uppercase">42m</span>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-border text-center">
                  <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest block mb-0.5">Engaged</span>
                  <span className="text-lg font-black text-foreground font-number uppercase">{game.activePlayers}</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 h-10 bg-muted hover:bg-muted/80 text-primary rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
              Full Analytics Report
              <MdArrowForward className="text-lg" />
            </button>
          </div>

          <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-4">Diagnostics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Node Status</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Ping Rate</span>
                <span className="text-foreground font-number tracking-tight">12ms</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-amber-100 dark:bg-amber-900/10 rounded-2xl border border-amber-500/20 relative overflow-hidden group">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed italic relative z-10 mb-3">
              "Note: Distribution logic for the Midnight Storm Championship requires a review before the 04:00 window."
            </p>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest relative z-10">
              <MdLightbulb className="text-base" /> Admin Notice
            </div>
          </div>

        </aside>
      </div>
    </main>
  );
};

export default Game;
