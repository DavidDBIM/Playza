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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Referral Performance */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-wider border-b border-border pb-4">
          <MdLink className="text-amber-500 text-lg" />
          Referral Performance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {referralStats.map((stat) => {
            const Icon = getRefIcon(stat.icon);
            return (
              <div key={stat.id} className="bg-muted/30 p-4 rounded-xl border border-border transition-all group hover:bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Icon 
                    className="text-lg group-hover:scale-110 transition-transform" 
                    style={{ color: stat.color === '#ffd700' ? 'oklch(0.85 0.15 90)' : stat.color }} 
                  />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-none">{stat.label}</span>
                </div>
                <p className="text-xl font-black font-number text-foreground tracking-tight">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loyalty Pulse */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h3 className="text-xs font-black text-foreground mb-8 flex items-center gap-3 uppercase tracking-wider border-b border-border pb-4">
          <MdStar className="text-primary text-lg" />
          Loyalty Program Pulse
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {loyaltyPulse.map((stat) => {
            const Icon = getLoyaltyIcon(stat.icon);
            return (
              <div key={stat.id} className="bg-muted/30 p-4 rounded-xl border border-border transition-all group hover:bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Icon 
                    className="text-lg group-hover:rotate-12 transition-transform" 
                    style={{ color: stat.color === '#ffd700' ? 'oklch(0.85 0.15 90)' : stat.color }} 
                  />
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-none">{stat.tier} Users</span>
                </div>
                <p className="text-xl font-black font-number text-foreground tracking-tight">{stat.users.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
