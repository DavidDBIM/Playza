import React, { useEffect, useState } from 'react';
import { ConnectivityContext } from './ConnectivityContextCore';

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Network back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('🚫 Network disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, wasOffline }}>
      {children}
      
      {/* Offline Overlay UI */}
      {!isOnline && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="relative">
              <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                  <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                  <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Connection Lost</h2>
              <p className="max-w-[280px] text-sm text-slate-400 font-medium leading-relaxed">
                Your game has been <span className="text-white font-bold italic">paused</span>. We'll resume automatically once you're back online.
              </p>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="size-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for Reconnection</span>
            </div>
          </div>
        </div>
      )}
    </ConnectivityContext.Provider>
  );
};
