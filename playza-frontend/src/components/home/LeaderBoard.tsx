import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboard } from "@/data/leaderboard";
import type { GameName, LeaderboardPlayer } from "@/types/types";
import { useState } from "react";
import { MdLeaderboard } from "react-icons/md";
import { formatZA } from "../../lib/formatCurrency";

const LeaderBoard = () => {
  const gameNames = Object.keys(leaderboard);

  const [activeGame, setActiveGame] = useState<GameName>("Mystic Quest");

  const leaderBoardData = leaderboard[activeGame];

  return (
    <section>
      <div className="mb-2">
        <h2 className="font-heading text-base md:text-xl font-bold flex gap-2 items-center mb-4">
          <MdLeaderboard className="text-chart-4" /> Games LeaderBoard
        </h2>
        <div className="flex gap-2 text-xs overflow-x-auto whitespace-nowrap mt-2 scroll-hidden scroll-smooth pb-2">
          {gameNames.map((game) => (
            <p
              key={game}
              className={`text-xs md:text-base  p-2 font-semibold rounded-full cursor-pointer ${activeGame === game ? "bg-primary" : "bg-border"}`}
              title={game}
              onClick={() => setActiveGame(game as GameName)}
            >
              {game}
            </p>
          ))}
        </div>
      </div>

      <Table className="w-full text-left">
        <TableHeader className="bg-accent/20 text-[10px] uppercase font-bold">
          <TableRow>
            <TableHead className="px-2 sm:px-6 py-2 md:py-3 text-[10px] uppercase font-bold">
              Rank
            </TableHead>
            <TableHead className="px-2 sm:px-6 py-2 md:py-3 text-[10px] uppercase font-bold">
              Username
            </TableHead>
            <TableHead className="px-2 sm:px-6 py-2 md:py-3 text-[10px] uppercase font-bold">
              Score
            </TableHead>
            <TableHead className="px-2 sm:px-6 py-2 md:py-3 text-[10px] uppercase font-bold text-right">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-accent-dark">
          {leaderBoardData.map(
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
              const isMe = rank === 4;

              return (
                <TableRow
                  key={id}
                  className={
                    isMe
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-accent-dark/20"
                  }
                >
                  <TableCell className="px-2 sm:px-6 py-2 md:py-4">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded font-bold text-[10px] ${
                        isGold
                          ? "bg-yellow-500/20 text-yellow-500"
                          : isSilver
                            ? "bg-slate-400/20 text-slate-700 dark:text-slate-300"
                            : isMe
                              ? "bg-primary text-background-dark"
                              : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {rank}
                    </div>
                  </TableCell>

                  <TableCell className="px-2 sm:px-6 py-2 md:py-4 flex items-center gap-2 md:gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <img src={avatar} alt={username} loading="lazy" />
                    </div>
                    <span
                      className={
                        isMe
                          ? "font-bold text-[10px] md:text-sm"
                          : "font-medium text-[10px] md:text-sm"
                      }
                    >
                      {username}
                    </span>
                  </TableCell>

                  <TableCell
                    className={`px-2 sm:px-6 py-4 font-bold text-[10px] md:text-sm ${
                      isGold || isMe ? "text-primary" : ""
                    }`}
                  >
                    {points.toLocaleString()}
                  </TableCell>

                  <TableCell className="px-2 sm:px-6 py-2 md:py-4 text-right text-[10px] md:text-sm">
                    {formatZA(Number(prizeWon) * 100)}
                  </TableCell>
                </TableRow>
              );
            },
          )}
        </TableBody>
      </Table>
    </section>
  );
};

export default LeaderBoard;
