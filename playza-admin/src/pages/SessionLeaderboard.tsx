import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MdArrowBack, MdFilterList, MdSearch, MdMoreVert, MdCircle } from 'react-icons/md';
import { Button } from '../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';

const SessionLeaderboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // mock 20 players for the full leaderboard
  const allPlayers = [
    { name: 'player1', userId: 'user_1', score: '89,420', rank: '#01', status: 'FINISHED', color: 'text-primary' },
    { name: 'player2', userId: 'user_2', score: '88,100', rank: '#02', status: 'PLAYING', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Loxley_Prime', userId: 'user_3', score: '82,100', rank: '#03', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Quantum_Gabe', userId: 'user_4', score: '81,540', rank: '#04', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Redux_Master', userId: 'user_5', score: '81,400', rank: '#05', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Echo_Shift', userId: 'user_6', score: '70,950', rank: '#06', status: 'PLAYING', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Frost_Bite', userId: 'user_7', score: '70,800', rank: '#07', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Titan_Fall', userId: 'user_8', score: '70,500', rank: '#08', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Viper_Strike', userId: 'user_9', score: '60,200', rank: '#09', status: 'PLAYING', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Nova_Burst', userId: 'user_10', score: '59,980', rank: '#10', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Cyber_Punk22', userId: 'user_11', score: '59,500', rank: '#11', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'currentUser', userId: 'user_12', score: '54,000', rank: '#12', status: 'PLAYING', color: 'text-slate-600 dark:text-slate-400' },
    { name: 'Jett_Lag', userId: 'user_13', score: '53,200', rank: '#13', status: 'FINISHED', color: 'text-slate-600 dark:text-slate-400' }
  ];

  const filteredPlayers = allPlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/sessions/${id || 'PX-992-ALPHA'}`)}
          className="group flex items-center gap-3 text-slate-500 hover:text-primary transition-all font-black px-6 h-12 rounded-2xl hover:bg-primary/5 uppercase text-xs tracking-widest"
        >
          <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          Back to Session
        </Button>
      </div>

      {/* Header Container */}
      <div className="glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                SESSION ROSTER
              </h1>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded-full border border-emerald-500/20 shadow-sm w-max">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE • 128 PLAYERS
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Roster overview for Midnight Qualifier (ID: #{id || 'PX-992-ALPHA'})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input 
                type="text" 
                placeholder="Search Player..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <Button variant="outline" className="h-12 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 gap-2 font-black uppercase text-[10px] tracking-widest">
              <MdFilterList className="text-lg" /> Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg">
        <div className="overflow-x-auto no-scrollbar min-h-120">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto shadow-none border-none">Player</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center h-auto shadow-none border-none">Score</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center h-auto shadow-none border-none">Rank</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest h-auto shadow-none border-none">Status</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right h-auto shadow-none border-none">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredPlayers.map((player, i) => (
                <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-border/10">
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-primary shadow-sm">
                        {player.name.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{player.name}</p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">ID: {player.userId}</p>
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
                      <MdCircle className={`text-[8px] ${player.status === 'PLAYING' ? 'animate-pulse' : ''}`} /> {player.status}
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
      </div>
    </main>
  );
};

export default SessionLeaderboard;
