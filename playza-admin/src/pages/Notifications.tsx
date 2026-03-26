import React, { useState } from 'react';
import NotiHistory from '../components/notifications/NotiHistory';
import SendNoti from '../components/notifications/SendNoti';
import Templates from '../components/notifications/Templates';
import NotificationDetails from '../components/notifications/NotificationDetails';
import { MdHistory, MdSend, MdCopyAll, MdNotifications } from 'react-icons/md';

type NotiTab = 'history' | 'send' | 'templates' | 'details';

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
      case 'details':
        return <NotificationDetails />;
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
    <div className="flex flex-col min-h-screen animate-in fade-in duration-700">
      {/* Page Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
              <MdNotifications className="text-4xl" />
            </div>
            <div>
              <h2 className="text-6xl font-black font-headline tracking-tighter text-slate-900 dark:text-white uppercase">
                Notifications
              </h2>
              <p className="text-slate-500 dark:text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] mt-1">
                Communication Command Center
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-slate-100 dark:bg-zinc-800/50 backdrop-blur-xl rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as NotiTab)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 ${
                activeTab === tab.id
                  ? 'bg-primary text-white dark:text-black shadow-lg shadow-primary/30 scale-105'
                  : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon className={`text-lg ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {renderContent()}
      </div>

      {/* Decorative Gradients */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 blur-[120px] pointer-events-none rounded-full z-[-1] opacity-50"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full z-[-1] opacity-30"></div>
    </div>
  );
};

export default Notifications;
