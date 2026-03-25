import React, { useState } from 'react';
import { 
  MdLeaderboard, 
  MdRefresh, 
  MdGamepad, 
  MdGroupAdd, 
  MdMilitaryTech 
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { gamesLeaderboardData, referralLeaderboard, loyaltyLeaderboard } from '../data/leaderboardData';
import GameLeaderboardCard from '../components/leaderboards/GameLeaderboardCard';
import ReferralLeaderboardTable from '../components/leaderboards/ReferralLeaderboardTable';
import LoyaltyLeaderboardTable from '../components/leaderboards/LoyaltyLeaderboardTable';


const Leaderboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Games' | 'Referrals' | 'Loyalty'>('Games');
  const [dateFilter, setDateFilter] = useState('Today');

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-8 max-w-350">
      {/* Header Section */}
      <div className="glass-card rounded-3xl p-6 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[120px] rounded-full -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <MdLeaderboard className="text-primary hidden md:inline-block" />
              Leaderboards
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
              Monitor rankings across games, referrals, and loyalty systems
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 dark:bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
            {['Today', 'Last 7 days', 'Last 30 days'].map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateFilter === filter 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                    : 'text-slate-500 hover:text-primary hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2 hidden md:block"></div>
            <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
              <MdRefresh className="text-xl" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-white/10 px-2 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'Games' as const, icon: MdGamepad },
          { id: 'Referrals' as const, icon: MdGroupAdd },
          { id: 'Loyalty' as const, icon: MdMilitaryTech }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-2 relative transition-all duration-300 group ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className={`text-xl transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">{tab.id}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_-4px_12px_rgba(var(--primary),0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'Games' && (
          <div className="grid grid-cols-1 gap-8">
            {gamesLeaderboardData.map(game => (
              <GameLeaderboardCard key={game.id} game={game} />
            ))}
          </div>
        )}
        
        {activeTab === 'Referrals' && (
          <ReferralLeaderboardTable data={referralLeaderboard} />
        )}
        
        {activeTab === 'Loyalty' && (
          <LoyaltyLeaderboardTable data={loyaltyLeaderboard} />
        )}
      </div>
    </main>
  );
};

export default Leaderboards;
