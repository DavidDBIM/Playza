import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboard } from "@/data/fullLeaderboard";
import { formatNaira } from "@/lib/formatNaira";
import type { GameName, LeaderboardPlayer } from "@/types/types";
import { useState } from "react";
import { MdLeaderboard, MdTrendingUp } from "react-icons/md";
import Search from "@/components/Search";

const LeaderBoard = () => {
  const gameNames = Object.keys(leaderboard);

  const [activeGame, setActiveGame] = useState<GameName>("Mystic Quest");
  const [searchQuery, setSearchQuery] = useState("");

  const leaderBoardData = leaderboard[activeGame] || [];
  
  const filteredData = leaderBoardData.filter((player) => 
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="flex-1 flex flex-col gap-4 overflow-hidden pb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <MdLeaderboard className="text-xl text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Top Players
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Global Ratings
            </p>
          </div>
        </div>
        
        <div className="w-full md:w-auto md:min-w-64">
          <Search 
            placeholder="Search username..." 
            value={searchQuery} 
            onChange={setSearchQuery} 
          />
        </div>
      </div>

      {/* Game Filters */}
      <div className="flex gap-2 text-xs overflow-x-auto whitespace-nowrap scroll-smooth pb-2 custom-scrollbar scrollbar-hide py-1 px-1">
        {gameNames.map((game) => (
          <button
            key={game}
            className={`px-4 py-2.5 font-bold rounded-xl cursor-pointer transition-all duration-300 border ${
              activeGame === game 
                ? "bg-primary text-white border-primary shadow-[0_4px_15px_rgba(168,85,247,0.4)] scale-105" 
                : "bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent dark:border-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
            }`}
            title={game}
            onClick={() => setActiveGame(game as GameName)}
          >
            {game}
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="glass-card rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden flex-1 flex flex-col relative">
        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />
        
        <div className="overflow-auto custom-scrollbar flex-1">
          <Table className="w-full text-left">
            <TableHeader>
              <TableRow className="border-b-slate-200 dark:border-b-white/10 hover:bg-transparent">
                <TableHead className="px-4 py-4 text-[10px] uppercase font-black tracking-widest text-slate-500 w-16 text-center">
                  Rank
                </TableHead>
                <TableHead className="px-4 py-4 text-[10px] uppercase font-black tracking-widest text-slate-500">
                  Player
                </TableHead>
                <TableHead className="px-4 py-4 text-[10px] uppercase font-black tracking-widest text-slate-500 hidden sm:table-cell">
                  Score
                </TableHead>
                <TableHead className="px-4 py-4 text-[10px] uppercase font-black tracking-widest text-slate-500 text-right">
                  Prize Won
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                    No players found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map(
                  ({
                    id,
                    rank,
                    avatar,
                    username,
                    points,
                    prizeWon,
                  }: LeaderboardPlayer) => {
                    const isGold = rank === 1;
                    const isSilver = rank === 2;
                    const isBronze = rank === 3;
                    const isMe = rank === 4;

                    const rankStyle = 
                      isGold ? "bg-playza-yellow/20 text-playza-yellow border-playza-yellow/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]" :
                      isSilver ? "bg-slate-300/20 text-slate-700 dark:text-slate-200 border-slate-300/50 shadow-[0_0_15px_rgba(203,213,225,0.2)]" :
                      isBronze ? "bg-amber-600/20 text-amber-500 border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.2)]" :
                      isMe ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]" :
                      "bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10";

                    return (
                      <TableRow
                        key={id}
                        className={`border-b-slate-200 dark:border-b-white/5 group transition-colors ${
                          isMe
                            ? "bg-primary/5 hover:bg-primary/10 border-l-[3px] border-l-primary"
                            : "hover:bg-slate-900/5 dark:hover:bg-white/5"
                        }`}
                      >
                        <TableCell className=" py-3 sm:py-4">
                          <div className="flex justify-center">
                            <div className={`size-7 sm:size-8 flex items-center justify-center rounded-xl font-black text-xs sm:text-sm border ${rankStyle} transition-all duration-300 group-hover:scale-110`}>
                              {rank}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className=" py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
                          <div className={`relative size-8 sm:size-10 rounded-full overflow-hidden border-2 ${isGold ? 'border-playza-yellow shadow-[0_0_10px_rgba(245,158,11,0.5)]' : isMe ? 'border-primary' : 'border-slate-200 dark:border-white/10'}`}>
                            <img src={avatar} alt={username} className="w-full h-full object-cover" />
                            {isGold && <div className="absolute inset-0 ring-inset ring-2 ring-playza-yellow/20 rounded-full" />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`transition-colors ${isMe ? "font-black text-slate-900 dark:text-white" : isGold ? "font-bold text-playza-yellow" : "font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                              {username} {isMe && <span className="text-primary text-[10px] ml-1 uppercase tracking-widest bg-primary/20 px-1.5 py-0.5 rounded-md">(You)</span>}
                            </span>
                            {/* Mobile Score Display (since Score column hides on sm) */}
                            <span className="sm:hidden text-[10px] text-slate-500 font-black tracking-widest flex items-center gap-1 mt-0.5">
                              <MdTrendingUp className="text-primary"/> {points.toLocaleString()} PTS
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className=" py-3 sm:py-4 font-black hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            {points.toLocaleString()} <span className="text-[9px] text-primary uppercase tracking-widest font-black">PTS</span>
                          </div>
                        </TableCell>

                        <TableCell className=" py-3 sm:py-4 text-right">
                          <div className="inline-block px-3 py-1.5 rounded-xl bg-playza-green/10 border border-playza-green/20">
                            <span className="font-mono text-sm sm:text-base font-black text-playza-green tracking-tighter">
                              {formatNaira(Number(prizeWon) * 100).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default LeaderBoard;
