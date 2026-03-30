import { useNavigate } from 'react-router';
import { useToast } from '@/context/toast';
import type { ChessRoom } from '@/types/chess';
import { Share2, Radar, ShieldCheck } from 'lucide-react';
import { ZASymbol } from '@/components/currency/ZASymbol';

interface WaitingRoomProps {
  room: ChessRoom;
}

const WaitingRoom = ({ room }: WaitingRoomProps) => {
  const toast = useToast();
  const navigate = useNavigate();

  const handleShare = () => {
    const text = `Join my H2H Chess battle on Playza! Room Code: ${room.code} \nLink: ${window.location.href}`;
    if (navigator.share) {
      navigator.share({
        title: 'Playza Chess Battle',
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 relative px-4 overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.05),transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-[120px] animate-pulse -z-10"></div>
      
      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                <Radar className="size-3 animate-spin-slow" />
                Waiting for Rival
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase italic">
                Battle <span className="text-primary">Ready</span>
            </h1>
        </div>

        {/* Central Information Hub */}
        <div className="bg-card/40 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent"></div>
            
            <div className="flex flex-col items-center space-y-10">
                {/* Room Code Section */}
                <div className="w-full text-center space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Access Protocol</p>
                    <div className="relative inline-block group/code transition-transform hover:scale-105">
                        <div className="absolute -inset-4 bg-primary/20 rounded-xl blur-2xl opacity-0 group-hover/code:opacity-100 transition-opacity"></div>
                        <div className="relative bg-white/40 dark:bg-black/40 border-2 border-primary/30 rounded-2xl px-10 py-6 backdrop-blur-3xl">
                            <span className="font-headline text-5xl md:text-6xl font-black text-foreground tracking-[0.2em] uppercase italic drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                                {room.code}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-center pt-2">
                        <button 
                            onClick={handleShare}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-headline font-black text-xs tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 uppercase italic"
                        >
                            <Share2 size={16} />
                            Invite Challenger
                        </button>
                    </div>
                </div>

                {/* Status Visualization */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Host Card */}
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 group/host hover:border-primary/40 transition-all">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-primary rounded-xl blur opacity-20 group-hover/host:opacity-100 transition-opacity"></div>
                            <img 
                                alt="Host" 
                                className="w-14 h-14 rounded-xl relative border border-slate-200 dark:border-white/10 shadow-xl" 
                                src={room.host?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=host"} 
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center">
                                <ShieldCheck className="text-white size-2" />
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 italic">The Host</p>
                            <h4 className="font-headline font-black text-xl text-foreground uppercase tracking-tight italic truncate max-w-37.5">
                                {room.host?.username || "Player"}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Stake:</span>
                                <span className="text-[10px] text-foreground font-black flex items-center gap-1">{room.stake} <ZASymbol className="scale-75" /></span>
                            </div>
                        </div>
                    </div>

                    {/* Opponent Card (Waiting) */}
                    <div className="bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/5 border-dashed rounded-2xl p-5 flex items-center gap-4 opacity-70 animate-pulse">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center border border-slate-300 dark:border-white/5 border-dashed italic font-headline font-black text-2xl text-slate-400 dark:text-muted-foreground/30">
                            ?
                        </div>
                        <div className="text-left space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-muted-foreground italic">Waiting...</p>
                            <h4 className="font-headline font-black text-xl text-slate-400 dark:text-muted-foreground/40 uppercase tracking-tight italic">
                                Seeking Rival
                            </h4>
                            <div className="h-1 bg-slate-200 dark:bg-white/5 w-24 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/30 w-1/2 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center pt-4">
             <button 
                onClick={() => navigate('/h2h')}
                className="text-slate-500 dark:text-muted-foreground hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.5em] italic flex items-center gap-4 group"
            >
                <div className="w-8 h-px bg-slate-300 dark:bg-white/10 group-hover:bg-red-500/50 transition-colors"></div>
                Abort Match
                <div className="w-8 h-px bg-slate-300 dark:bg-white/10 group-hover:bg-red-500/50 transition-colors"></div>
            </button>
            <p className="mt-8 text-slate-400 dark:text-muted-foreground/40 text-[9px] font-medium tracking-widest uppercase italic text-center">
                Secure encrypted H2H channel linked. Waiting for peer authentication.
            </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
