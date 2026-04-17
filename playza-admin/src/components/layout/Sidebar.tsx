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
  MdEmojiPeople
} from 'react-icons/md';
import { Link, useLocation } from 'react-router';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-card border-r border-border shadow-2xl flex-col gap-2 py-8 z-50 transition-all duration-300 hidden lg:flex">
      <div className="px-8 mb-10">
        <h1 className="text-2xl font-black text-primary tracking-tighter font-headline">PLAYZA</h1>
        <p className="font-headline uppercase tracking-widest text-[10px] font-black text-muted-foreground mt-1">Admin Console</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {[
          { path: '/', pathMatch: '/', icon: MdDashboard, label: 'Dashboard' },
          { path: '/users', pathMatch: '/users', icon: MdGroup, label: 'Users' },
          { path: '/games', pathMatch: '/games', icon: MdSportsEsports, label: 'Games' },
          { path: '/games', pathMatch: '/sessions', icon: MdTimer, label: 'Sessions' },
          { path: '/leaderboards', pathMatch: '/leaderboards', icon: MdLeaderboard, label: 'Leaderboards' },
          { path: '/transactions', pathMatch: '/transactions', icon: MdPayments, label: 'Transactions' },
          { path: '/withdrawals', pathMatch: '/withdrawals', icon: MdAccountBalanceWallet, label: 'Withdrawals' },
          { path: '/rewards', pathMatch: '/rewards', icon: MdRedeem, label: 'Rewards' },
          { path: '/ambassadors', pathMatch: '/ambassadors', icon: MdEmojiPeople, label: 'Ambassadors' },
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
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="text-xl" />
              <span className="font-headline uppercase tracking-widest text-[10px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
