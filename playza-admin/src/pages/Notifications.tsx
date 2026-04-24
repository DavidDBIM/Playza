import React, { useState } from 'react';
import NotiHistory from '../components/notifications/NotiHistory';
import SendNoti from '../components/notifications/SendNoti';
import Templates from '../components/notifications/Templates';
import { MdHistory, MdSend, MdCopyAll, MdNotifications } from 'react-icons/md';

type NotiTab = 'history' | 'send' | 'templates';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NotiTab>('history');

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return <NotiHistory />;
      case 'send':
        return <SendNoti onBack={() => setActiveTab('history')} />;
      case 'templates':
        return <Templates />;
      default:
        return <NotiHistory />;
    }
  };

  const tabs = [
    { id: 'history', label: 'History', icon: MdHistory },
    { id: 'send', label: 'Send New', icon: MdSend },
    { id: 'templates', label: 'Templates', icon: MdCopyAll },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Page Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-400/30">
            <MdNotifications className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Notifications</h1>
            <p className="text-xs text-muted-foreground font-medium">Communication Command Center</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-card rounded-2xl border border-border shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NotiTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <tab.icon className={`text-lg transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {renderContent()}
      </div>

    </div>
  );
};

export default Notifications;
