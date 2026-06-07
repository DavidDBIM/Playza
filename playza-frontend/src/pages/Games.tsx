import FullGame from "@/components/game/FullGame";
import SEO from "@/components/SEO"

const Games = () => {
  return (
    <div className="flex-1 min-w-0 overflow-hidden relative">
      <SEO
      title="Games – Play & Win"
      description="Browse all Playza skill games. From arcade to chess, quiz and more. Pick a game, pay your entry fee and compete for real ZA rewards."
      url="/games"
      keywords="playza games, skill games Nigeria, arcade games, chess online, quiz games Nigeria"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] pointer-events-none" />
      <FullGame />
    </div>
  );
};

export default Games;
