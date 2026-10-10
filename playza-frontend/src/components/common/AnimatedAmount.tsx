import { useEffect, useRef, useState } from "react";

interface AnimatedAmountProps {
  value: number;
  className?: string;
  // "full" → 1,234,567   |   "compact" → 1.2M (for tight spaces like card pills)
  format?: "full" | "compact";
  durationMs?: number;
}

const formatAmount = (n: number, format: "full" | "compact") =>
  format === "compact"
    ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
    : Math.round(n).toLocaleString("en-US");

// Counts smoothly from whatever is currently on screen to the new value, so
// when the poll brings back a bigger total the number visibly ticks up
// instead of jumping. Skips the motion for people who prefer reduced motion.
export const AnimatedAmount = ({
  value,
  className,
  format = "full",
  durationMs = 1200,
}: AnimatedAmountProps) => {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (from === to) return;

    // Reduced motion: jump straight to the new value (zero-length tween).
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 0 : durationMs;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out
      const next = from + (to - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{formatAmount(display, format)}</span>;
};