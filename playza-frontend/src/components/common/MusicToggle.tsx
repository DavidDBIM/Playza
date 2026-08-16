import { Music, Music2 } from "lucide-react";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

interface MusicToggleProps {
  className?: string;
}

/**
 * A small, self-contained toggle — drop it into any gameplay screen's
 * header/toolbar. Off by default (and only turns on when the person taps
 * it, per browser autoplay rules), remembers their choice for next time.
 */
export default function MusicToggle({ className = "" }: MusicToggleProps) {
  const { isPlaying, toggle, volume, setVolume } = useBackgroundMusic();

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        onClick={toggle}
        aria-label={isPlaying ? "Turn off background music" : "Turn on background music"}
        title={isPlaying ? "Music on — tap to mute" : "Music off — tap to play"}
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isPlaying ? "bg-violet-500/20 text-violet-300" : "bg-black/10 dark:bg-white/10 text-foreground/35 hover:text-foreground/60"
        }`}
      >
        {isPlaying ? <Music2 size={13} /> : <Music size={13} />}
      </button>
      {isPlaying && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          aria-label="Music volume"
          className="w-14 h-1 accent-violet-500 cursor-pointer"
        />
      )}
    </div>
  );
}