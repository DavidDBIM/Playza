import { MdLink, MdPersonAdd, MdPieChart, MdAttachMoney, MdStar } from 'react-icons/md';
import type { ReferralStat, LoyaltyPulse } from '../../data/adminData';

export const GrowthInsights: React.FC<{ 
  referralStats: ReferralStat[], 
  loyaltyPulse: LoyaltyPulse[] 
}> = ({ referralStats, loyaltyPulse }) => {
  const getRefIcon = (iconName: string) => {
    switch (iconName) {
      case 'MdLink': return MdLink;
      case 'MdPersonAdd': return MdPersonAdd;
      case 'MdPieChart': return MdPieChart;
      case 'MdAttachMoney': return MdAttachMoney;
      default: return MdLink;
    }
  };

  const getLoyaltyIcon = (iconName: string) => {
    switch (iconName) {
      case 'MdStar':
      case 'MdAssignmentTurnedIn':
      case 'MdStarOutline':
      case 'MdWorkspacePremium': return MdStar;
      default: return MdStar;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Referral Performance */}
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/2 shadow-xl">
        <h3 className="text-xl font-black font-headline text-slate-900 dark:text-[#E5E2E3] mb-8 flex items-center gap-3 uppercase tracking-widest text-[10px]">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/10">
            <MdLink className="text-amber-600 dark:text-[#ffd700] text-xl" />
          </div>
          Referral Performance
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {referralStats.map((stat) => {
            const Icon = getRefIcon(stat.icon);
            return (
              <div key={stat.id} className="bg-white/50 dark:bg-white/3 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner hover:bg-white/80 dark:hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <Icon 
                    className={`text-xl group-hover:scale-110 transition-transform ${stat.color === '#ffd700' ? 'text-amber-600 dark:text-[#ffd700]' : ''}`} 
                    style={{ color: stat.color === '#ffd700' ? undefined : stat.color }} 
                  />
                  <span className="text-[10px] font-black text-slate-400 dark:text-[#E5E2E3]/20 uppercase tracking-[0.2em] leading-none">{stat.label}</span>
                </div>
                <p className="text-2xl font-black font-headline text-slate-900 dark:text-[#E5E2E3] tracking-tighter">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loyalty Pulse */}
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/2 shadow-xl">
        <h3 className="text-xl font-black font-headline text-slate-900 dark:text-[#E5E2E3] mb-8 flex items-center gap-3 uppercase tracking-widest text-[10px]">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/10">
            <MdStar className="text-primary text-xl" />
          </div>
          Loyalty Program Pulse
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {loyaltyPulse.map((stat) => {
            const Icon = getLoyaltyIcon(stat.icon);
            return (
              <div key={stat.id} className="bg-white/50 dark:bg-white/3 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner hover:bg-white/80 dark:hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <Icon 
                    className={`text-xl group-hover:rotate-12 transition-transform ${stat.color === '#ffd700' ? 'text-amber-600 dark:text-[#ffd700]' : ''}`} 
                    style={{ color: stat.color === '#ffd700' ? undefined : stat.color }} 
                  />
                  <span className="text-[10px] font-black text-slate-400 dark:text-[#E5E2E3]/20 uppercase tracking-[0.2em] leading-none">{stat.tier} Users</span>
                </div>
                <p className="text-2xl font-black font-headline text-slate-900 dark:text-[#E5E2E3] tracking-tighter">{stat.users.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
