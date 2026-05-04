import { useEffect } from 'react';
import { useToast } from '@/context/toast';
import { supabase } from '@/config/supabase';

const ActivityToasts = ({ sessionId }: { sessionId: string }) => {
  const toast = useToast();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_toasts_${sessionId}`)
      .on("broadcast", { event: "LEADERBOARD_UPDATE" }, (payload) => {
        const { username, newScore, isHighScore } = payload.payload;
        
        if (isHighScore) {
          toast.custom('rank', `achieved a new high score of ${newScore.toLocaleString()}!`, username);
        } else if (Math.random() > 0.7) { // Don't show every single score, only 30% of them to avoid spam
          toast.custom('score', `finished a round with ${newScore.toLocaleString()} points.`, username);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, toast]);

  return null;
};

export default ActivityToasts;
