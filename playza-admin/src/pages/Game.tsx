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
      <div className="p-10 text-center">
        <h2 className="text-2xl font-black text-primary">Game Simulation Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested matrix coordinates do not exist.</p>
        <Button onClick={() => navigate('/games')} className="mt-4">Back to Matrix</Button>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-10 min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Game Header Section */}
      <section className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-card border border-border/50 flex items-center justify-center overflow-hidden shadow-2xl relative group shrink-0">
            <img 
              src={game.thumbnail} 
              alt={game.title} 
              className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/60 to-transparent"></div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-primary uppercase">{game.title}</h2>
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5 border ${
                game.isActive 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' 
                  : 'bg-muted/10 text-muted-foreground border-muted/10'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${game.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-muted-foreground'}`}></span>
                {game.isActive ? 'Active' : 'Offline'}
              </span>
            </div>
            <p className="text-muted-foreground font-medium flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs md:text-sm">
              <span className="flex items-center gap-1.5"><MdCategory className="text-primary" /> {game.category} • {game.mode}</span>
              <span className="flex items-center gap-1.5"><MdCalendarToday className="text-primary" /> Created {new Date(game.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
            <MdEdit className="text-lg" /> Quick Edit
          </Button>
          <Button className="flex-1 lg:flex-none h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold shadow-xl shadow-primary/20 uppercase tracking-widest text-xs">
            <MdRocketLaunch className="text-lg" /> Launch Game
          </Button>
        </div>
      </section>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
        {/* Primary Tabs & Content */}
        <div className="md:col-span-12 lg:col-span-8 space-y-8">
          <div className="flex items-center gap-8 border-b border-border/50 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('sessions')}
              className={`pb-4 transition-all flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap ${activeTab === 'sessions' ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted-foreground font-medium hover:text-foreground'}`}
            >
              <MdStadium /> Sessions
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-4 transition-all flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap ${activeTab === 'about' ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted-foreground font-medium hover:text-foreground'}`}
            >
              <MdInfo /> About
            </button>
            <button 
              onClick={() => setActiveTab('rules')}
              className={`pb-4 transition-all flex items-center gap-2 text-xs uppercase tracking-widest whitespace-nowrap ${activeTab === 'rules' ? 'text-primary font-bold border-b-2 border-primary' : 'text-muted-foreground font-medium hover:text-foreground'}`}
            >
              <MdGavel /> Rules
            </button>
          </div>

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Arena Deployments</h3>
                <Button size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 rounded-lg font-black uppercase tracking-widest text-[10px]">
                  <MdAdd /> Create Session
                </Button>
              </div>

              {/* Session Card 1: Live (Demo) */}
              <div 
                className="glass-card bg-card p-6 rounded-3xl border border-border/50 hover:border-primary/30 transition-all group relative overflow-hidden shadow-lg cursor-pointer"
                onClick={() => navigate('/sessions/ALPHA-992')}
              >
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg">Live</div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neon District Brawl</p>
                    <h4 className="text-xl md:text-2xl font-black font-headline text-foreground uppercase">Regional Qualifiers #12</h4>
                    <div className="flex flex-wrap items-center gap-6 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Prize Pool</span>
                        <span className="text-lg font-black text-primary">₦500k+</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Active Assets</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">45 <span className="text-muted-foreground/40 font-medium text-sm">/ 100</span></span>
                          <div className="w-24 h-1.5 bg-muted/20 rounded-full overflow-hidden shrink-0">
                            <div className="w-[45%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
                      <MdSchedule className="text-primary" /> Started 15m ago
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0" onClick={(e) => e.stopPropagation()}><MdEdit /></Button>
                      <Button className="flex-1 md:flex-none px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">View Analytics</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Card 2: Upcoming (Demo) */}
              <div 
                className="glass-card bg-card p-6 rounded-3xl border border-border/50 hover:border-primary/30 transition-all group opacity-80 hover:opacity-100 shadow-md cursor-pointer"
                onClick={() => navigate('/sessions/STORM-443')}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Global Series</p>
                      <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Upcoming</span>
                    </div>
                    <h4 className="text-xl md:text-2xl font-black font-headline text-foreground uppercase">Midnight Storm Championship</h4>
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Estimated Pool</span>
                        <span className="text-lg font-black text-primary">₦2.5M+</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Reservations</span>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black">12 <span className="text-muted-foreground/40 font-medium text-sm">/ 256</span></span>
                          <div className="w-24 h-1.5 bg-muted/20 rounded-full overflow-hidden shrink-0">
                            <div className="w-[5%] h-full bg-amber-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
                      <MdEvent className="text-amber-500" /> Starts in 4h 20m
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0" onClick={(e) => e.stopPropagation()}><MdEdit /></Button>
                      <Button variant="outline" className="flex-1 md:flex-none px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">Manage Roster</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card bg-card p-8 rounded-3xl border border-border/50 shadow-lg">
                <h3 className="text-xl font-black font-headline uppercase tracking-tight mb-6">Simulation Overview</h3>
                <p className="text-muted-foreground leading-relaxed font-medium mb-6">
                  {game.title} is a high-stakes {game.category} experience designed for the elite tier of the Playza Empire. 
                  Engineered with proprietary latency-reduction architecture, it offers a seamless competitive environment 
                  where skill is the only currency that matters.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 bg-muted/10 rounded-2xl border border-border/30">
                    <MdBarChart className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">Architecture</h4>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">V3 Virtualized Logic Gateways</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-muted/10 rounded-2xl border border-border/30">
                    <MdHistory className="text-primary text-2xl shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1">Update Vector</h4>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">Bi-Weekly Matrix Shifts</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card bg-card p-6 rounded-2xl border border-border/30 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdShield className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2">Integrity</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Anti-Cheat Matrix Enabled</p>
                </div>
                <div className="glass-card bg-card p-6 rounded-2xl border border-border/30 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdTrendingUp className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2">Growth</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">+12% Monthly Engagement</p>
                </div>
                <div className="glass-card bg-card p-6 rounded-2xl border border-border/30 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MdRocketLaunch className="text-primary text-xl" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2">Deployment</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Playza Cloud Engine</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card bg-card p-8 rounded-3xl border border-border/50 shadow-lg">
                <h3 className="text-xl font-black font-headline uppercase tracking-tight mb-8 flex items-center gap-3">
                  <MdGavel className="text-primary" /> Governance & Directives
                </h3>
                <div className="space-y-6">
                  {[
                    "Fair Play Protocol: Any manipulation of game memory or network packets results in immediate IP blacklisting.",
                    "Session Integrity: Players must remain connected for at least 80% of the session to qualify for prize distribution.",
                    "Ranking Weights: Elo ratings are calculated using the Playza-Alpha 4.0 algorithm, accounting for opponent difficulty.",
                    "Prize Escrow: All funds are held in secure imperial escrow until session validation is complete."
                  ].map((rule, i) => (
                    <div key={i} className="flex gap-4 group">
                      <span className="text-primary font-black italic text-sm opacity-50 group-hover:opacity-100 transition-opacity">0{i+1}</span>
                      <p className="text-xs font-semibold text-foreground/80 leading-relaxed uppercase tracking-wide border-l border-primary/20 pl-4">{rule}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-10 h-12 border-primary/10 text-primary hover:bg-primary/5 rounded-xl font-black uppercase tracking-widest text-[10px]">
                  Download Official Codex
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Sidebar */}
        <aside className="md:col-span-12 lg:col-span-4 space-y-8">
          <div className="glass-card bg-card p-8 rounded-3xl relative overflow-hidden border border-border/50 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-xs font-black font-headline uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <MdTrendingUp className="text-primary text-lg" /> Performance Pulse
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Revenue (Last 7 Days)</span>
                  <span className="text-emerald-500 font-black text-[10px] flex items-center gap-1">
                    <MdTrendingUp /> +12.4%
                  </span>
                </div>
                <div className="text-3xl font-black text-foreground tracking-tighter">₦12.4M</div>
                <div className="h-12 w-full mt-4 flex items-end gap-1 opacity-50">
                  {[40, 60, 55, 80, 70, 90, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-primary' : 'bg-primary/30'} h-[${h}%]`} 
                    ></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted/20 rounded-2xl border border-border/30">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block mb-1">Avg Vol</span>
                  <span className="text-lg font-black">42m</span>
                </div>
                <div className="p-4 bg-muted/20 rounded-2xl border border-border/30">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block mb-1">Engaged</span>
                  <span className="text-lg font-black">{game.activePlayers}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 h-12 rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] transition-all group">
              Full Spectrum Report
              <MdArrowForward className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="glass-card bg-card p-6 rounded-3xl border border-border/30 shadow-md">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 opacity-50">System Diagnostics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground/60">Node Status</span>
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-muted-foreground/60">Ping Rate</span>
                <span>12ms</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border-l-4 border-primary/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <MdLightbulb className="text-6xl text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed italic relative z-10">
              "System Alert: Distribution logic for the Midnight Storm Championship requires calibration before the 04:00 register window starts."
            </p>
            <div className="mt-4 flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              <MdLightbulb className="text-sm" /> Admin Directive
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Game;
