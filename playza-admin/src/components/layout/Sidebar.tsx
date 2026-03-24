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
  MdLayers 
} from 'react-icons/md';
import { NavLink } from 'react-router';

const Sidebar: React.FC = () => {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-card border-r border-border shadow-2xl flex flex-col gap-2 py-8 z-50 transition-all duration-300 hidden lg:flex">
      <div className="px-8 mb-10">
        <h1 className="text-2xl font-black text-primary tracking-tighter font-headline">PLAYZA</h1>
        <p className="font-headline uppercase tracking-widest text-[10px] font-black text-muted-foreground mt-1">Admin Console</p>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {[
          { to: '/', icon: MdDashboard, label: 'Dashboard' },
          { to: '/users', icon: MdGroup, label: 'Users' },
          { to: '/games', icon: MdSportsEsports, label: 'Games' },
          { to: '/games', icon: MdTimer, label: 'Sessions' },
          { to: '/leaderboards', icon: MdLeaderboard, label: 'Leaderboards' },
          { to: '/transactions', icon: MdPayments, label: 'Transactions' },
          { to: '/withdrawals', icon: MdAccountBalanceWallet, label: 'Withdrawals' },
          { to: '/rewards', icon: MdRedeem, label: 'Rewards' },
          { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
          { to: '/content', icon: MdLayers, label: 'Content' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <item.icon className="text-xl" />
            <span className="font-headline uppercase tracking-widest text-[10px] font-black">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-8 py-6 border-t border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-headline font-black uppercase tracking-widest text-primary">System Operational</span>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden">
          <img alt="Admin Profile" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4xY-PLI5GuwlDUnOY8s2wGMdkVmGIoVZIz3hohZUDNe9vqsdPPrGHGmgbgK7wQ9s1jF2vEtcSoX8EoygqexMw2sFkJUimyMLvHRyMGK6aXwasaFq3iJGHcWxu6Pexgg6ASjsKzc7tEj5-0DcvMnzE3zRI6xFz6yeraTmFFp9E89ketZYcvIvYSUQznD12REsNeYg9Nlt1eRymwqgfIzhOEIGKKLu1UoQVvuQOXH8lKX25sMyjGjAVRNaA-FiOvPI5GY6EMLERmU8" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
