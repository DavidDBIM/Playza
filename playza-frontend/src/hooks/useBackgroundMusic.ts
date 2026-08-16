import { useState, useEffect, useCallback, useRef } from "react";
import { startBackgroundMusic, stopBackgroundMusic, setBackgroundMusicVolume } from "@/lib/backgroundMusic";

const STORAGE_KEY_ENABLED = "playza_music_enabled";
const STORAGE_KEY_VOLUME = "playza_music_volume";

/**
 * Drop this into any gameplay screen (chess, quiz) that wants the optional
 * background music toggle. Remembers the person's last choice — if they
 * had it on, it tries to resume automatically next time they land on a
 * game screen. Browsers require a real click/tap before audio can start
 * at all, so that auto-resume can silently fail on first load; the person
 * just taps the toggle once and it's on for the rest of the session.
 */
export function useBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    if (typeof window === "undefined") return 0.5;
    const saved = window.localStorage.getItem(STORAGE_KEY_VOLUME);
    const parsed = saved ? parseFloat(saved) : NaN;
    return isNaN(parsed) ? 0.5 : parsed;
  });
  const attemptedAutoResume = useRef(false);

  useEffect(() => {
    if (attemptedAutoResume.current) return;
    attemptedAutoResume.current = true;
    const wanted = window.localStorage.getItem(STORAGE_KEY_ENABLED) === "true";
    if (!wanted) return;
    startBackgroundMusic(volume)
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay was blocked (no user gesture yet on this page load) —
        // the toggle button just stays off until they tap it themselves.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stopBackgroundMusic();
      setIsPlaying(false);
      window.localStorage.setItem(STORAGE_KEY_ENABLED, "false");
    } else {
      startBackgroundMusic(volume)
        .then(() => {
          setIsPlaying(true);
          window.localStorage.setItem(STORAGE_KEY_ENABLED, "true");
        })
        .catch(() => {});
    }
  }, [isPlaying, volume]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    window.localStorage.setItem(STORAGE_KEY_VOLUME, String(v));
    setBackgroundMusicVolume(v);
  }, []);

  return { isPlaying, toggle, volume, setVolume };
}