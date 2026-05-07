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
  MdCurrencyExchange,
  MdChat,
  MdShield,
  MdLogout,
  MdPowerSettingsNew,
  MdClose
} from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/auth.service';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
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
  { path: '/feedback', pathMatch: '/feedback', icon: MdChat, label: 'Feedback' },
  { path: '/security-logs', pathMatch: '/security-logs', icon: MdShield, label: 'Security Logs' },
  { path: '/content', pathMatch: '/content', icon: MdLayers, label: 'Content' },
];

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/signin");
    if (onClose) onClose();
  };

  return (
    <div className="h-full w-64 bg-card border-r border-border shadow-2xl flex flex-col gap-2 py-6 transition-all duration-300">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tighter font-heading italic leading-none">PLAYZA</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-0.5 w-4 bg-primary rounded-full"></div>
            <p className="font-heading uppercase tracking-[0.3em] text-[8px] font-black text-muted-foreground">Admin Command</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
          >
            <MdClose className="text-xl" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = item.pathMatch === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.pathMatch);

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
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

        {/* SECURITY ACTIONS */}
        <div className="mt-6 px-3 space-y-2">
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] px-3 mb-2 opacity-50">
            Security Protocols
          </p>
          
          <button
            onClick={() => {
              if (window.confirm("TERMINATE ALL ACTIVE SESSIONS? This will log you out of all devices including this one.")) {
                // Implement global invalidation logic
                handleLogout();
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 border border-amber-500/10"
          >
            <MdPowerSettingsNew className="text-base transition-transform duration-300 group-hover:rotate-90" />
            <span className="font-black text-[10px] uppercase tracking-widest font-heading">
              Global Kill Switch
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10"
          >
            <MdLogout className="text-base transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-black text-[10px] uppercase tracking-widest font-heading">
              Terminate Session
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 overflow-y-auto z-50">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Drawer */}
          <div
            className="relative z-10 h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
