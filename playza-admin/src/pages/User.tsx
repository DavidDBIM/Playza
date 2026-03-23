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
    { id: 'matches', icon: MdHistory, label: 'Combat Log' },
    { id: 'transactions', icon: MdReceiptLong, label: 'Capital Flow' },
    { id: 'referrals', icon: MdAccountTree, label: 'Downline Network' }
  ] as const;

  return (
    <main className="p-4 md:p-8 space-y-6 md:space-y-10 max-w-400 mx-auto w-full min-h-screen bg-background text-foreground transition-all duration-500">
      
      {/* Identity Hero - Redesigned & Factored */}
      <UserIdentityHero user={user} />

      {/* Stats - Factored */}
      <UserAdvancedMetrics user={user} />

      {/* Activity Console - Factored */}
      <section className="glass-card bg-card rounded-[2.5rem] overflow-hidden border border-border/40 shadow-[0_32px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_100px_rgba(0,0,0,0.3)] transition-all">
        {/* Navigation Tabs */}
        <div className="px-6 md:px-12 pt-8 border-b border-border/20 flex flex-wrap gap-10 bg-muted/30 backdrop-blur-xl">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-6 text-xs font-black transition-all flex items-center gap-3 outline-none relative group uppercase tracking-[0.3em] ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground/30 hover:text-foreground/60'
              }`}
            >
              <tab.icon className={`text-xl transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-primary' : ''}`} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-5px_15px_rgba(var(--primary-rgb),0.5)] transition-all duration-500"></div>
              )}
              {tab.id === 'referrals' && (
                <span className="bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-full ring-2 ring-card shadow-lg ml-1">{user.referrals}</span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'matches' && <CombatLog data={matchHistory} />}
          {activeTab === 'transactions' && <FinancialFlow data={transactionHistory} />}
          {activeTab === 'referrals' && <DownlineNetwork data={referralHistory} />}
        </div>
      </section>
    </main>
  );
};

export default User;
