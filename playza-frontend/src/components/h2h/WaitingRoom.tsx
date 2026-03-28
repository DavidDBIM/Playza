import { useNavigate } from 'react-router';
import { useToast } from '@/context/toast';
import type { ChessRoom } from '@/types/chess';

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
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/2 h-full w-full pointer-events-none -z-10 blur-3xl"></div>
      
      {/* Immersive Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="relative z-10 w-full max-w-xl text-center space-y-12">
        {/* Room Code Display */}
        <div className="space-y-6">
            <h2 className="font-headline text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                ROOM <span className="text-primary italic">CODE</span>
            </h2>
            <div className="bg-white/5 dark:bg-black/30 border-2 border-primary/40 rounded-xl p-8 backdrop-blur-3xl shadow-2xl relative group hover:border-primary/60 transition-all">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase">SHARE WITH FRIEND</div>
                <p className="font-headline text-6xl md:text-7xl font-black text-foreground tracking-[0.3em] uppercase italic drop-shadow-2xl">
                    {room.code}
                </p>
            </div>
            <button 
                onClick={handleShare}
                className="mt-6 bg-secondary text-black px-12 py-4 rounded-2xl font-headline font-black text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl uppercase italic flex items-center gap-3 mx-auto"
            >
                <span className="material-symbols-outlined">share</span>
                SHARE LINK
            </button>
        </div>

        {/* Loading Spinner / Hologram */}
        <div className="relative flex flex-col items-center py-8">
          <div className="w-48 h-48 rounded-full border-8 border-primary/10 flex items-center justify-center relative shadow-[0_0_60px_rgba(var(--primary),0.1)]">
            <div className="absolute inset-0 rounded-full border-8 border-secondary border-t-transparent animate-spin"></div>
            <div className="w-40 h-40 rounded-full bg-linear-to-br from-primary/10 to-accent/10 backdrop-blur-3xl flex items-center justify-center overflow-hidden border border-white/5">
                <span className="material-symbols-outlined text-secondary text-5xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>radar</span>
            </div>
          </div>
          <p className="mt-8 text-muted-foreground font-black text-xs uppercase tracking-[0.4em] max-w-md mx-auto leading-relaxed animate-pulse">
            Establishing secure connection...
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col gap-5">
           <div className="p-6 rounded-xl bg-white/5 dark:bg-black/20 border border-white/10 backdrop-blur-2xl flex items-center justify-between group hover:border-primary/40 transition-all shadow-xl">
             <div className="flex items-center gap-6">
               <div className="relative">
                 <div className="absolute -inset-1 bg-primary rounded-xl blur-md opacity-20 group-hover:opacity-100 transition-opacity"></div>
                 <img alt="Host" className="w-16 h-16 rounded-2xl relative border-2 border-slate-950 shadow-2xl" src={room.host?.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuAhAiatk8ur8Q-K0Le1QhqDjnbsMxjwXmHipaxc0UTBbB6GqTpa1bQsZSPyNtYShYLKMV55WZmzBcNZ3_Gq52CZV8ok1z6oE-mR7bT27msTPFJ6luvSHZvvMf-uuHTethFKlDascncDE8mm73Q8DbT2_9OX4OIpi96CRL5yF-xBIcY_9c1Kdkz8b0ajbbqgf3PGiew4rZ4BUY0AEjLtKWAxWuVcYn7cpA-K-JjjHtmItNWB80dIcLEadlSa8YyjKlr5O332LsAshaY"} />
               </div>
               <div className="text-left">
                 <h4 className="font-headline font-black text-xl text-foreground uppercase tracking-widest italic flex items-center gap-2 group-hover:text-primary transition-colors">
                    {room.host?.username || "Commander"}
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded italic">HOST</span>
                 </h4>
                 <p className="text-[10px] text-muted-foreground font-black tracking-[0.2em] uppercase mt-1 italic">Stake: {room.stake} ZA</p>
               </div>
             </div>
             <div className="text-right">
               <span className="material-symbols-outlined text-green-500 text-2xl animate-pulse">verified_user</span>
             </div>
           </div>

           <div className="p-6 rounded-xl bg-linear-to-r from-primary/5 to-transparent border border-white/5 flex items-center justify-between opacity-60 animate-pulse transition-all">
             <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center italic font-headline font-black text-2xl text-muted-foreground/30 rotate-12">
                 ?
               </div>
               <div className="text-left">
                 <h4 className="font-headline font-black text-xl text-muted-foreground uppercase tracking-[0.3em] italic">Waiting for Rival...</h4>
                 <div className="h-1 bg-white/5 w-32 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-primary/40 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                 </div>
               </div>
             </div>
             <div className="animate-[spin_4s_linear_infinite] opacity-20">
                <span className="material-symbols-outlined text-white text-3xl">settings_input_component</span>
             </div>
           </div>
        </div>

        <div className="pt-10">
          <button 
            onClick={() => navigate('/h2h')}
            className="text-muted-foreground hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.5em] italic flex items-center gap-3 mx-auto group"
          >
            <span className="w-5 h-px bg-muted-foreground/20 group-hover:bg-red-500/50"></span>
            CANCEL & LEAVE
            <span className="w-5 h-px bg-muted-foreground/20 group-hover:bg-red-500/50"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
