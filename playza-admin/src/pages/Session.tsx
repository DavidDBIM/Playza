import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MdTrendingUp, 
  MdBolt, 
  MdSettings, 
  MdIosShare, 
  MdContentCopy,
  MdFilterList,
  MdMoreVert,
  MdArrowDropUp,
  MdArrowDropDown,
  MdCircle
} from 'react-icons/md';
import { Button } from '../components/ui/button';

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <main className="p-4 md:p-10 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Session Header */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-border/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black tracking-widest uppercase rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Live Simulation
              </span>
              <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-50">Node: #{id || 'PX-992-ALPHA'}</span>
            </div>
            <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-primary uppercase">Cyber-Arena Elite Qualifier</h1>
            <p className="text-muted-foreground font-body max-w-xl text-sm md:text-base">Global qualifying round for the 2024 Pro-Circuit Finals. Real-time telemetry monitoring enabled.</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/games')}
              className="flex-1 lg:flex-none h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              Abort Link
            </Button>
            <Button className="flex-1 lg:flex-none h-14 px-8 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-black shadow-xl uppercase tracking-widest text-[10px]">
              Terminate Session
            </Button>
          </div>
        </section>

        {/* Top Level Stats Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Players', value: '128', sub: '+12 since start', color: 'text-primary' },
            { label: 'Current Prize Pool', value: '₦42,500', sub: 'In-Game Credits', color: 'text-emerald-500' },
            { label: 'Elapsed Time', value: '02:14:55', sub: 'EST. 04:00:00', color: 'text-amber-500' },
            { label: 'Avg. Latency', value: '14ms', sub: 'Stable Stream', color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="glass-card bg-card p-6 rounded-3xl border border-border/50 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex flex-col">
                <span className={`font-headline text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-60 underline underline-offset-4 decoration-primary/20">{stat.sub}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Control Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Player List (8/12) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="glass-card bg-card rounded-3xl border border-border/50 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-border/30 flex justify-between items-center bg-muted/5">
                <h2 className="font-headline text-lg font-black text-primary uppercase tracking-tight">Active Roster</h2>
                <Button variant="ghost" size="sm" className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <MdFilterList className="text-lg" /> Filter Sequence
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-muted/20 border-b border-border/30">
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Player Identity</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Current Score</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Rank</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Signal</th>
                      <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {[
                      { name: 'NeoKnight_99', region: 'EUW', score: '14,290', rank: '#01', color: 'text-primary' },
                      { name: 'Z-Void_Runner', region: 'USE', score: '13,842', rank: '#02', color: 'text-muted-foreground' },
                      { name: 'Loxley_Prime', region: 'ASIA', score: '12,100', rank: '#03', color: 'text-muted-foreground' }
                    ].map((player, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-6 border-b border-border/10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-center font-black text-primary shadow-inner">
                              {player.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-black text-sm text-foreground uppercase tracking-tight">{player.name}</p>
                              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5">Vector: {player.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center border-b border-border/10">
                          <span className="font-headline font-black text-primary text-lg">{player.score}</span>
                        </td>
                        <td className="px-6 py-6 text-center border-b border-border/10">
                          <span className={`font-black italic text-sm ${player.color}`}>{player.rank}</span>
                        </td>
                        <td className="px-6 py-6 border-b border-border/10">
                          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <MdCircle className="text-[8px] animate-pulse" /> Live
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right border-b border-border/10">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MdMoreVert className="text-xl text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-muted/5 text-center border-t border-border/30">
                <button className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all">
                  Initialize Full Roster Sync (128 Players)
                </button>
              </div>
            </div>
          </div>

          {/* Right Rail: Live Ranking & Events (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Live Ranking Module */}
            <div className="glass-card bg-card rounded-3xl p-8 border border-border/50 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h2 className="font-headline text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
                Live Pulse Ranking
                <MdTrendingUp className="text-xl" />
              </h2>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'NeoKnight_99', score: '14,290', trend: 'up' },
                  { rank: 2, name: 'Z-Void_Runner', score: '13,842', trend: 'down' },
                  { rank: 3, name: 'Loxley_Prime', score: '12,100', trend: 'stable' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${item.rank === 1 ? 'bg-primary/10 border-primary/20' : 'bg-muted/5 border-border/30'}`}>
                    <span className={`font-headline font-black italic w-6 text-2xl ${item.rank === 1 ? 'text-primary' : 'text-muted-foreground/50'}`}>{item.rank}</span>
                    <div className="flex-1">
                      <p className="font-black text-xs text-foreground uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{item.score} PTS</p>
                    </div>
                    {item.trend === 'up' && <MdArrowDropUp className="text-emerald-500 text-2xl" />}
                    {item.trend === 'down' && <MdArrowDropDown className="text-rose-500 text-2xl" />}
                    {item.trend === 'stable' && <span className="w-4 h-0.5 bg-muted-foreground/30 rounded-full"></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="glass-card bg-card rounded-3xl p-8 border border-border/50 shadow-xl flex flex-col h-[400px]">
              <h2 className="font-headline text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
                Telemetry Log
                <MdBolt className="text-xl text-amber-500" />
              </h2>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
                {[
                  { time: '14:52:10', tag: 'System', msg: 'Round 4 initialized successfully.', color: 'text-amber-500' },
                  { time: '14:51:04', tag: 'Player', msg: 'NeoKnight_99 captured the Obsidian Core.', color: 'text-primary' },
                  { time: '14:48:33', tag: 'Economy', msg: 'Prize Pool Updated: New total ₦42,500 credits.', color: 'text-emerald-500' },
                  { time: '14:45:12', tag: 'Traffic', msg: 'Spectator Count: 1.2k users viewing live.', color: 'text-muted-foreground' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-border shrink-0 group-hover:bg-primary transition-colors"></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">{log.time}</p>
                      <p className="text-xs font-bold leading-relaxed">
                        <span className={`${log.color} uppercase tracking-tight mr-1.5`}>{log.tag}:</span>
                        <span className="text-foreground/80">{log.msg}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Contextual Action Bar */}
        <section className="bg-card/80 backdrop-blur-3xl p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border border-border/50 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Simulation Mode</p>
              <p className="text-sm font-black text-primary uppercase tracking-tight">Tournament Elimination</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Broadcast Cipher</p>
              <p className="text-sm font-black text-amber-500 flex items-center gap-2 cursor-pointer uppercase tracking-tight">
                playza.live/e/alpha-992
                <MdContentCopy className="text-xs opacity-50 hover:opacity-100 transition-opacity" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Node Health</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map(i => <span key={i} className="w-3 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>)}
                <span className="text-[10px] font-black text-emerald-500 uppercase ml-2 tracking-widest">Optimal Spectrum</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-14 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-background">
              <MdSettings className="text-lg" /> Protocol Settings
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none h-14 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-background">
              <MdIosShare className="text-lg" /> Export Telemetry
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Session;
