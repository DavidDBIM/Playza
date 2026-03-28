import { useEffect, useCallback } from 'react';
import { useToast } from '@/context/toast';
import type { ToastType } from '@/components/ui/Toast';

const ActivityToasts = () => {
  const toast = useToast();

  const triggerRandomToast = useCallback(() => {
    const users = ['BladeRunner', 'ShadowNinja', 'GuselTony', 'NeonStrike', 'CyberPunk', 'AceHunter', 'SilentWolf', 'NoobKiller', 'AlphaGamer', 'DragonSlayer'];
    const user = users[Math.floor(Math.random() * users.length)];
    
    const scenarios = [
      { type: 'entry' as ToastType, user, msg: 'just jumped into the arena!' },
      { type: 'rank' as ToastType, user, msg: `climbed to Rank #${Math.floor(Math.random() * 50) + 1}!` },
      { type: 'overtake' as ToastType, user, msg: `just overtook ${users[Math.floor(Math.random() * users.length)]}!` },
      { type: 'winning_zone' as ToastType, msg: `Only ${Math.floor(Math.random() * 500) + 100} points needed to enter the Prize Zone!` },
      { type: 'score' as ToastType, user, msg: `scored ${Math.floor(Math.random() * 5000) + 1000} points in one go!` },
      { type: 'achievement' as ToastType, user, msg: 'unlocked the "Untouchable" badge!' },
      { type: 'streak' as ToastType, user, msg: 'is on a massive 10-match win streak!' },
      { type: 'overtake' as ToastType, user: 'System', msg: 'New match starting in Arena #04!' },
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    toast.custom(scenario.type, scenario.msg, scenario.user);
  }, [toast]);

  useEffect(() => {
    const initialTimer = setTimeout(triggerRandomToast, 2000);
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerRandomToast();
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [triggerRandomToast]);

  return null; // The ToastProvider handles rendering
};

export default ActivityToasts;
