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
    <main className="p-6 space-y-6">
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
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">SESSION ROSTER</h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black tracking-wider uppercase rounded-lg border border-emerald-500/20 shadow-sm w-max">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                LIVE • 128 PLAYERS
              </span>
            </div>
            <p className="text-muted-foreground font-medium text-sm">
              Roster overview for Midnight Qualifier (ID: #{id || 'PX-992-ALPHA'})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
              <input 
                type="text" 
                placeholder="Search Player..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-muted border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
              />
            </div>
            <Button variant="outline" className="h-10 border-border rounded-xl text-muted-foreground hover:bg-muted text-[10px] font-black uppercase tracking-wider gap-2">
              <MdFilterList className="text-base" /> Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest h-auto">Player</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center h-auto">Score</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center h-auto">Rank</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest h-auto">Status</TableHead>
                <TableHead className="px-6 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right h-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredPlayers.map((player, i) => (
                <TableRow key={i} className="hover:bg-muted/30 transition-colors border-none">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-xs">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-sm text-foreground uppercase tracking-tight">{player.name}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">ID: {player.userId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-black text-foreground text-base font-number">
                    {player.score}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className={`font-black italic text-sm font-number ${player.color}`}>{player.rank}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      <MdCircle className={`text-[8px] ${player.status === 'PLAYING' ? 'animate-pulse' : ''}`} /> {player.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
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
