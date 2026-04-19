import React from 'react';
import { 
  MdDashboard, 
  MdGroup, 
  MdSportsEsports, 
  MdTimer, 
  MdLeaderboard, 
  MdPayments, 
  MdAccountBalanceWallet, 
  MdRedeem, 
  MdNotifications, 
  MdLayers, 
  MdEmojiPeople,
  MdCurrencyExchange
} from 'react-icons/md';
import { Link, useLocation } from 'react-router';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-card border-r border-border shadow-2xl flex flex-col gap-2 py-6 z-50 transition-all duration-300 hidden lg:flex">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-black text-primary tracking-tighter font-heading italic leading-none">PLAYZA</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-0.5 w-4 bg-primary rounded-full"></div>
          <p className="font-heading uppercase tracking-[0.3em] text-[8px] font-black text-muted-foreground">Admin Command</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {[
          { path: '/', pathMatch: '/', icon: MdDashboard, label: 'Dashboard' },
          { path: '/users', pathMatch: '/users', icon: MdGroup, label: 'Users' },
          { path: '/games', pathMatch: '/games', icon: MdSportsEsports, label: 'Games' },
          { path: '/sessions', pathMatch: '/sessions', icon: MdTimer, label: 'Sessions' },
          { path: '/leaderboards', pathMatch: '/leaderboards', icon: MdLeaderboard, label: 'Leaderboards' },
          { path: '/transactions', pathMatch: '/transactions', icon: MdPayments, label: 'Transactions' },
          { path: '/withdrawals', pathMatch: '/withdrawals', icon: MdAccountBalanceWallet, label: 'Withdrawals' },
          { path: '/rewards', pathMatch: '/rewards', icon: MdRedeem, label: 'Rewards' },
          { path: '/ambassadors', pathMatch: '/ambassadors', icon: MdEmojiPeople, label: 'Ambassadors' },
          { path: '/referral-payouts', pathMatch: '/referral-payouts', icon: MdCurrencyExchange, label: 'Referral Payouts' },
          { path: '/notifications', pathMatch: '/notifications', icon: MdNotifications, label: 'Notifications' },
          { path: '/content', pathMatch: '/content', icon: MdLayers, label: 'Content' },
        ].map((item) => {
          const isActive = item.pathMatch === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.pathMatch);
            
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className={`text-base transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
              <span className="font-black text-[10px] uppercase tracking-widest font-heading transition-all group-hover:pl-0.5">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute left-0 w-1 h-4 bg-primary-foreground rounded-r-full shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-6">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Engine Integrity</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-foreground uppercase tracking-wider">Optimal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
