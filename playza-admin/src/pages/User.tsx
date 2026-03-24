import React, { useState } from 'react';
import { useParams } from 'react-router';
import { 
  MdHistory, 
  MdReceiptLong, 
  MdAccountTree 
} from 'react-icons/md';
import { 
  usersData, 
  matchHistory, 
  transactionHistory, 
  referralHistory 
} from '../data/usersData';
import { UserIdentityHero } from '../components/user/UserIdentityHero';
import { UserAdvancedMetrics } from '../components/user/UserAdvancedMetrics';
import { CombatLog, FinancialFlow, DownlineNetwork } from '../components/user/UserActivityTables';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'matches' | 'transactions' | 'referrals'>('matches');

  // Find user by ID or username (demo logic)
  const user = usersData.find(u => u.id === id || u.username === id) || usersData[0];

  const tabs = [
    { id: 'matches', icon: MdHistory, label: 'Game History' },
    { id: 'transactions', icon: MdReceiptLong, label: 'Transactions' },
    { id: 'referrals', icon: MdAccountTree, label: 'Referrals' }
  ] as const;

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-8 space-y-6 md:space-y-10 max-w-350">
      
      {/* Identity Hero - Redesigned & Factored */}
      <UserIdentityHero user={user} />

      {/* Stats - Factored */}
      <UserAdvancedMetrics user={user} />

      {/* Activity Console */}
      <section className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300">
        
        {/* Navigation Tabs */}
        <div className="px-4 md:px-8 border-b border-slate-200 dark:border-white/10 flex overflow-x-auto scrollbar-hide bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl">
          <div className="flex flex-nowrap w-max">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-5 px-6 whitespace-nowrap text-xs md:text-sm font-bold transition-all flex items-center gap-3 outline-none relative group ${
                  activeTab === tab.id 
                    ? 'text-primary bg-primary/5' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className={`text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary' : ''}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--primary-rgb),0.5)] transition-all duration-500"></div>
                )}
                {tab.id === 'referrals' && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm ml-1 ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                  }`}>{user.referrals}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[500px] bg-white/50 dark:bg-transparent">
          {activeTab === 'matches' && <CombatLog data={matchHistory} />}
          {activeTab === 'transactions' && <FinancialFlow data={transactionHistory} />}
          {activeTab === 'referrals' && <DownlineNetwork data={referralHistory} />}
        </div>
      </section>
    </main>
  );
};

export default User;
