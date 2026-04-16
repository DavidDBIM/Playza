import React, { useState } from 'react';
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
  MdCircle,
  MdCheck
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sessionStatus, setSessionStatus] = useState('Live');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statuses = ['Live', 'Ongoing', 'Upcoming', 'Ended'];

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-10 max-w-350">
      <div className="mx-auto space-y-10 border-b-none">
        {/* Hero Session Header */}
        <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-full border border-emerald-500/20 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                Live Session
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Session ID: #{id || 'PX-992-ALPHA'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Midnight Qualifier</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-sm md:text-base">Managing active global qualifier match. Real-time player statistics and events tracking enabled.</p>
          </div>
          <div className="flex flex-wrap flex-col sm:flex-row items-center gap-4 w-full lg:w-auto mt-6 lg:mt-0 relative">
            
            {/* Custom Dropdown */}
            <div className="relative w-full sm:w-auto">
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-12 px-6 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm min-w-35"
              >
                <div className="flex items-center gap-2">
                  {sessionStatus === 'Live' && <MdCircle className="text-[10px] text-emerald-500 animate-pulse" />}
                  {sessionStatus}
                </div>
                <MdArrowDropDown className={`text-xl transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-14 left-0 w-full bg-white dark:bg-[#1a1c22] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 flex flex-col">
                  {statuses.map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setSessionStatus(status);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 h-10 flex items-center justify-between text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {status === 'Live' && <MdCircle className="text-[8px] text-emerald-500 pointer-events-none" />}
                        <span className={sessionStatus === status ? "text-primary" : "text-slate-600 dark:text-slate-400"}>{status}</span>
                      </div>
                      {sessionStatus === status && <MdCheck className="text-primary text-base" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap w-full sm:w-auto items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate(`/sessions/${id || 'PX-992-ALPHA'}/leaderboard`)}
                className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-primary"
              >
                Track Match
              </Button>
              <Button className="flex-1 sm:flex-none h-12 px-6 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl font-black shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                <MdCircle className="animate-pulse" /> Push Live
              </Button>
              <Button onClick={() => navigate('/games')} className="flex-1 sm:flex-none h-12 px-6 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-black shadow-lg shadow-rose-600/20 uppercase tracking-widest text-[10px] transition-all">
                Terminate
              </Button>
            </div>
          </div>
        </section>

        {/* Top Level Stats Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Roster', value: '124', sub: 'Max Players: 200', color: 'text-slate-900 dark:text-white', primaryLine: true },
            { label: 'Gross Pool', value: '186,000', sub: 'Total Base', color: 'text-slate-500 dark:text-slate-300' },
            { label: 'Net Prize Pool', value: '167,400', sub: 'After Platform Fee', color: 'text-emerald-500' },
            { label: 'Winners Split', value: '20', sub: 'Paid Winners', color: 'text-primary' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group bg-white/50 dark:bg-transparent">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
              <div className="flex flex-col">
                <span className={`text-3xl font-black tracking-tighter ${stat.color} ${stat.primaryLine ? 'drop-shadow-sm' : ''}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-2.5 underline underline-offset-4 decoration-primary/20">{stat.sub}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Main Control Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Player List (8/12) */}
          <div className="col-span-1 xl:col-span-8 space-y-6">
            <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden bg-white/50 dark:bg-transparent">
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Roster</h2>
                <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">
                  <MdFilterList className="text-lg" /> Filter Roster
                </Button>
              </div>
              <div className="overflow-x-auto no-scrollbar min-h-120">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest h-auto font-black shadow-none border-none text-slate-500 dark:text-slate-400">Player</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-center h-auto font-black shadow-none border-none text-slate-500 dark:text-slate-400">Score</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-center h-auto font-black shadow-none border-none text-slate-500 dark:text-slate-400">Rank</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest h-auto font-black shadow-none border-none text-slate-500 dark:text-slate-400">Status</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] uppercase tracking-widest text-right h-auto font-black shadow-none border-none text-slate-500 dark:text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-200 dark:divide-white/10">
                    {[
                      { name: 'NeoKnight_99', region: 'EUW', score: '14,290', rank: '#01', color: 'text-primary' },
                      { name: 'Z-Void_Runner', region: 'USE', score: '13,842', rank: '#02', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Loxley_Prime', region: 'ASIA', score: '12,100', rank: '#03', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Quantum_Gabe', region: 'USW', score: '11,540', rank: '#04', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Redux_Master', region: 'EUW', score: '11,400', rank: '#05', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Echo_Shift', region: 'OCE', score: '10,950', rank: '#06', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Frost_Bite', region: 'SA', score: '10,800', rank: '#07', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Titan_Fall', region: 'AFR', score: '10,500', rank: '#08', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Viper_Strike', region: 'USE', score: '10,200', rank: '#09', color: 'text-slate-600 dark:text-slate-400' },
                      { name: 'Nova_Burst', region: 'EUW', score: '9,980', rank: '#10', color: 'text-slate-600 dark:text-slate-400' }
                    ].map((player, i) => (
                      <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-border/10">
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-primary shadow-sm font-black">
                              {player.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{player.name}</p>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Region: {player.region}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-center font-black text-slate-900 dark:text-white text-lg">
                          {player.score}
                        </TableCell>
                        <TableCell className="px-6 py-5 text-center">
                          <span className={`font-black italic text-sm ${player.color} ${player.rank === '#01' ? 'drop-shadow-sm' : ''}`}>{player.rank}</span>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <MdCircle className="text-[8px] animate-pulse" /> Live
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10">
                            <MdMoreVert className="text-xl" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-white/5 text-center border-t border-slate-200 dark:border-white/10">
                <button 
                  onClick={() => navigate(`/sessions/${id || 'PX-992-ALPHA'}/leaderboard`)}
                  className="text-[10px] font-black text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all"
                >
                  Show All 128 Players
                </button>
              </div>
            </div>
          </div>

          {/* Right Rail: Live Ranking & Events (4/12) */}
          <div className="col-span-1 xl:col-span-4 space-y-8">
            {/* Live Ranking Module */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden bg-white/50 dark:bg-transparent">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
                Live Ranking
                <MdTrendingUp className="text-xl text-primary" />
              </h2>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'NeoKnight_99', score: '14,290', trend: 'up' },
                  { rank: 2, name: 'Z-Void_Runner', score: '13,842', trend: 'down' },
                  { rank: 3, name: 'Loxley_Prime', score: '12,100', trend: 'stable' }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${item.rank === 1 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'}`}>
                    <span className={`font-black italic w-6 text-2xl ${item.rank === 1 ? 'text-primary drop-shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>{item.rank}</span>
                    <div className="flex-1">
                      <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.score} PTS</p>
                    </div>
                    {item.trend === 'up' && <MdArrowDropUp className="text-emerald-500 text-2xl" />}
                    {item.trend === 'down' && <MdArrowDropDown className="text-rose-500 text-2xl" />}
                    {item.trend === 'stable' && <span className="w-4 h-0.5 bg-slate-300 dark:bg-white/20 rounded-full"></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="glass-card rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col h-100 bg-white/50 dark:bg-transparent">
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center justify-between">
                Live Feed
                <MdBolt className="text-xl text-amber-500" />
              </h2>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {[
                  { time: '14:52:10', tag: 'System', msg: 'Round 4 initialized.', color: 'text-amber-500' },
                  { time: '14:51:04', tag: 'Player', msg: 'NeoKnight_99 achieved highest multiplier.', color: 'text-primary' },
                  { time: '14:48:33', tag: 'Economy', msg: 'Prize pool updated to ₦42,500.', color: 'text-emerald-500' },
                  { time: '14:45:12', tag: 'Traffic', msg: 'Spectator count at 1.2k users.', color: 'text-slate-500 dark:text-slate-400' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/20 shrink-0 group-hover:bg-primary transition-colors"></div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-1">{log.time}</p>
                      <p className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300">
                        <span className={`${log.color} uppercase tracking-tight mr-1.5`}>{log.tag}:</span>
                        <span>{log.msg}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-[#1a1c22] p-6 md:p-8 rounded-[2rem] flex flex-col xl:flex-row items-center justify-between gap-8 border border-slate-200 dark:border-white/10 shadow-lg relative overflow-hidden group mb-10">
          <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-12 gap-y-6 text-center xl:text-left">
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Session Target</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Qualifier Stage</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Public Link</p>
              <p className="text-sm font-black text-primary flex items-center justify-center xl:justify-start gap-2 cursor-pointer uppercase tracking-tight hover:underline underline-offset-4">
                playza.live/match/mx-992
                <MdContentCopy className="text-xs text-slate-400 hover:text-primary transition-colors" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Engine State</p>
              <div className="flex items-center justify-center xl:justify-start gap-1.5">
                {[1, 2, 3].map(i => <span key={i} className="w-4 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>)}
                <span className="text-[10px] font-black text-emerald-500 uppercase ml-2 tracking-widest">Normal</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 w-full xl:w-auto relative z-10">
            <Button variant="outline" className="flex-1 xl:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
              <MdSettings className="text-lg" /> Settings
            </Button>
            <Button variant="outline" className="flex-1 xl:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300">
              <MdIosShare className="text-lg" /> Export Logs
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Session;
