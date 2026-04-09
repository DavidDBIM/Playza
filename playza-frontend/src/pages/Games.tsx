import FullGame from "@/components/game/FullGame";

const Games = () => {
  return (
    <div className="flex-1 min-w-0 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] pointer-events-none" />
      <FullGame />
    </div>
  );
};

export default Games;
