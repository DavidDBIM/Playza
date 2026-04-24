import React, { useState, useEffect } from "react";
import { Trophy, Plus, Users, Swords, ChevronRight, Cpu } from "lucide-react";
import * as soccerApi from "@/api/soccer.api";
import { useToast } from "@/context/toast";
import SoccerGame, { TEAM_COLORS, type Difficulty } from "./SoccerGame";

// ─── Types ────────────────────────────────────────────────────────────────────
type TournamentSize = 4 | 8 | 16 | 32;

interface TournamentTeam {
  id: string;
  name: string;
  colorIdx: number;
  isBot: boolean;
  difficulty?: Difficulty;
}

interface Match {
  id: string;
  round: number;
  matchNum: number;
  team0?: TournamentTeam;
  team1?: TournamentTeam;
  score0: number;
  score1: number;
  winnerId?: string;
  status: "pending" | "playing" | "done";
}

interface Tournament {
  id: string;
  name: string;
  size: TournamentSize;
  teams: TournamentTeam[];
  matches: Match[];
  currentRound: number;
  status: "setup" | "active" | "finished";
  champion?: TournamentTeam;
}

interface SoccerTournamentProps {
  userId: string;
  username: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BOT_NAMES = ["FC Playza Bot", "AI United", "Robot FC", "Cyber City", "Digital Dynamo", "Binary Boys", "Code Kings", "Pixel FC", "Virtual Vipers", "Net Ninjas", "Data Derby", "Logic Lions", "Algo Athletics", "Stack Strikers", "Byte Ballers", "Cache Champions", "Hash Hammers", "Loop Lions", "Null Navigators", "Spawn Spartans", "Thread Titans", "Queue Queens", "Heap Heroes", "Merge Mavs", "Sort Strikers", "Index Invaders", "Node Nomads", "Dom Dragons", "Git Giants", "API Aces"];

function makeBotTeam(idx: number, difficulty: Difficulty): TournamentTeam {
  return { id: `bot-${idx}`, name: BOT_NAMES[idx % BOT_NAMES.length], colorIdx: (idx + 1) % TEAM_COLORS.length, isBot: true, difficulty };
}

function generateBracket(teams: TournamentTeam[]): Match[] {
  const matches: Match[] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  let matchId = 0;
  for (let i = 0; i < shuffled.length; i += 2) {
    matches.push({ id: `m${matchId++}`, round: 1, matchNum: i / 2, team0: shuffled[i], team1: shuffled[i + 1], score0: 0, score1: 0, status: "pending" });
  }
  const totalRounds = Math.log2(teams.length);
  for (let r = 2; r <= totalRounds; r++) {
    const prevRoundMatches = matches.filter(m => m.round === r - 1).length;
    for (let i = 0; i < prevRoundMatches / 2; i++) {
      matches.push({ id: `m${matchId++}`, round: r, matchNum: i, score0: 0, score1: 0, status: "pending" });
    }
  }
  return matches;
}

function advanceBracket(tournament: Tournament, match: Match, winnerId: string): Tournament {
  const updated = { ...tournament, matches: tournament.matches.map(m => m.id === match.id ? { ...m, status: "done" as const, winnerId } : m) };
  const nextRoundMatch = updated.matches.find(m => m.round === match.round + 1 && m.matchNum === Math.floor(match.matchNum / 2));
  if (nextRoundMatch) {
    const winner = [match.team0, match.team1].find(t => t?.id === winnerId);
    if (match.matchNum % 2 === 0) nextRoundMatch.team0 = winner;
    else nextRoundMatch.team1 = winner;
  }
  const currentRoundDone = updated.matches.filter(m => m.round === match.round).every(m => m.status === "done");
  const totalRounds = Math.log2(tournament.size);
  if (currentRoundDone && match.round === totalRounds) {
    const champion = [match.team0, match.team1].find(t => t?.id === winnerId);
    return { ...updated, status: "finished", champion };
  }
  if (currentRoundDone) updated.currentRound = match.round + 1;
  return updated;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SoccerTournament: React.FC<SoccerTournamentProps> = ({ userId, username }) => {
  const toast = useToast();
  const [phase, setPhase] = useState<"create" | "setup" | "bracket" | "match" | "champion">("create");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [isMyMatch, setIsMyMatch] = useState(false);

  // Create form state
  const [tName, setTName] = useState(`${username}'s Tournament`);
  const [tSize, setTSize] = useState<TournamentSize>(8);
  const [tDifficulty, setTDifficulty] = useState<Difficulty>("medium");
  const [myTeamName, setMyTeamName] = useState(username);
  const [myColorIdx, setMyColorIdx] = useState(0);

  const handleCreate = () => {
    const myTeam: TournamentTeam = { id: userId, name: myTeamName, colorIdx: myColorIdx, isBot: false };
    const botsNeeded = tSize - 1;
    const bots = Array.from({ length: botsNeeded }, (_, i) => makeBotTeam(i, tDifficulty));
    const teams = [myTeam, ...bots];
    const matches = generateBracket(teams);
    setTournament({ id: `t-${Date.now()}`, name: tName, size: tSize, teams, matches, currentRound: 1, status: "active" });
    setPhase("bracket");
  };

  const handlePlayMatch = (match: Match) => {
    const playerInMatch = match.team0?.id === userId || match.team1?.id === userId;
    setActiveMatch(match);
    setIsMyMatch(playerInMatch);
    setPhase("match");
  };

  const handleMatchResult = (score: [number, number], winner: 0 | 1 | null) => {
    if (!activeMatch || !tournament) return;
    const winnerTeam = winner === 0 ? activeMatch.team0 : winner === 1 ? activeMatch.team1 : null;
    const updatedMatch = { ...activeMatch, score0: score[0], score1: score[1], winnerId: winnerTeam?.id };
    const updated = advanceBracket(tournament, updatedMatch, winnerTeam?.id || activeMatch.team0?.id || "");
    setTournament(updated);
    setActiveMatch(null);
    if (updated.status === "finished") setPhase("champion");
    else setPhase("bracket");
  };

  // ── Bracket view
  if (phase === "bracket" && tournament) {
    const totalRounds = Math.log2(tournament.size);
    const roundNames: Record<number, string> = {
      1: "Round of " + tournament.size,
      [totalRounds - 1]: "Semi Finals",
      [totalRounds]: "Final",
    };
    const pendingMyMatch = tournament.matches.find(m =>
      m.round === tournament.currentRound && m.status === "pending" &&
      (m.team0?.id === userId || m.team1?.id === userId)
    );

    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-xl uppercase tracking-widest">{tournament.name}</h2>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest">{tournament.size} Teams · Round {tournament.currentRound}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Play your match CTA */}
        {pendingMyMatch && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 font-black text-sm uppercase tracking-widest">⚽ Your turn to play!</p>
              <p className="text-gray-400 text-[10px] mt-1">vs {pendingMyMatch.team0?.id === userId ? pendingMyMatch.team1?.name : pendingMyMatch.team0?.name}</p>
            </div>
            <button
              onClick={() => handlePlayMatch(pendingMyMatch)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest px-4 py-2 rounded-xl text-xs transition-all active:scale-95"
            >
              Play Now
            </button>
          </div>
        )}

        {/* Bracket rounds */}
        <div className="overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {Array.from({ length: totalRounds }, (_, rIdx) => {
              const r = rIdx + 1;
              const roundMatches = tournament.matches.filter(m => m.round === r);
              return (
                <div key={r} className="flex flex-col gap-3">
                  <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest text-center">
                    {roundNames[r] || `Round ${r}`}
                  </h3>
                  <div className="flex flex-col gap-4" style={{ marginTop: rIdx === 0 ? 0 : `${Math.pow(2, rIdx) * 20}px` }}>
                    {roundMatches.map(match => {
                      const isPlaying = match.round === tournament.currentRound && match.status === "pending";
                      const myTeamInMatch = match.team0?.id === userId || match.team1?.id === userId;
                      return (
                        <div key={match.id} className={`w-44 rounded-xl border transition-all ${match.status === "done" ? "border-white/5 bg-gray-900" : isPlaying ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/5 bg-gray-900/50"}`}>
                          {[match.team0, match.team1].map((team, ti) => (
                            <div key={ti} className={`flex items-center justify-between px-3 py-2 ${ti === 0 ? "border-b border-white/5" : ""} ${match.winnerId === team?.id ? "bg-green-500/10" : ""}`}>
                              <div className="flex items-center gap-2 min-w-0">
                                {team ? <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TEAM_COLORS[team.colorIdx]?.primary || "#888" }} /> : <div className="w-3 h-3 rounded-full bg-gray-700" />}
                                {team?.isBot && <Cpu size={10} className="text-gray-500 shrink-0" />}
                                <span className="text-white font-black text-[10px] truncate">{team?.name || "TBD"}</span>
                              </div>
                              {match.status === "done" && (
                                <span className={`font-black text-xs tabular-nums ${match.winnerId === team?.id ? "text-green-400" : "text-gray-500"}`}>
                                  {ti === 0 ? match.score0 : match.score1}
                                </span>
                              )}
                            </div>
                          ))}
                          {isPlaying && match.team0 && match.team1 && (
                            <button
                              onClick={() => handlePlayMatch(match)}
                              className="w-full text-center py-1.5 text-yellow-400 font-black text-[9px] uppercase tracking-widest hover:bg-yellow-500/10 transition-all rounded-b-xl"
                            >
                              {myTeamInMatch ? "▶ Play" : "▶ Simulate"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Match phase
  if (phase === "match" && activeMatch && tournament) {
    const myTeamObj = activeMatch.team0?.id === userId ? activeMatch.team0 : activeMatch.team1;
    const oppTeamObj = activeMatch.team0?.id === userId ? activeMatch.team1 : activeMatch.team0;
    const myTeamSide: 0 | 1 = activeMatch.team0?.id === userId ? 0 : 1;
    const botDiff = oppTeamObj?.difficulty || tDifficulty;

    return (
      <div className="w-full flex flex-col items-center pb-6">
        <div className="mb-3 text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">{tournament.name} · Round {tournament.currentRound}</p>
          <h3 className="text-white font-black text-lg">
            {activeMatch.team0?.name} <span className="text-yellow-400">vs</span> {activeMatch.team1?.name}
          </h3>
        </div>
        <SoccerGame
          myTeam={myTeamSide}
          team0Name={activeMatch.team0?.name || "Team A"}
          team1Name={activeMatch.team1?.name || "Team B"}
          team0Color={TEAM_COLORS[activeMatch.team0?.colorIdx || 0]?.primary || "#e63946"}
          team1Color={TEAM_COLORS[activeMatch.team1?.colorIdx || 1]?.primary || "#2196F3"}
          isBot={true}
          botDifficulty={botDiff}
          gameMode="timed"
          onGameOver={handleMatchResult}
        />
        {!isMyMatch && (
          <button
            onClick={() => {
              // Simulate: random result
              const s0 = Math.floor(Math.random() * 5);
              const s1 = Math.floor(Math.random() * 5);
              handleMatchResult([s0, s1], s0 > s1 ? 0 : s1 > s0 ? 1 : null);
            }}
            className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-black uppercase tracking-widest rounded-xl text-xs transition-all"
          >
            Simulate Result
          </button>
        )}
      </div>
    );
  }

  // ── Champion screen
  if (phase === "champion" && tournament?.champion) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-6 py-12">
        <div className="text-6xl animate-bounce">🏆</div>
        <div className="text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">{tournament.name} · Champion</p>
          <h2 className="text-white font-black text-3xl uppercase tracking-widest mt-1">{tournament.champion.name}</h2>
          {!tournament.champion.isBot && <p className="text-yellow-400 font-black text-sm mt-2">Congratulations!</p>}
        </div>
        <div className="w-20 h-20 rounded-full border-4 border-yellow-500 flex items-center justify-center" style={{ backgroundColor: TEAM_COLORS[tournament.champion.colorIdx]?.primary || "#888" }}>
          {tournament.champion.isBot ? <Cpu size={32} className="text-white" /> : <Trophy size={32} className="text-white" />}
        </div>
        <button
          onClick={() => setPhase("create")}
          className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
        >
          New Tournament
        </button>
      </div>
    );
  }

  // ── Create / Setup screen
  return (
    <div className="w-full max-w-sm mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <Trophy size={32} className="text-yellow-400 mx-auto mb-2" />
        <h2 className="text-white font-black text-xl uppercase tracking-widest">Create Tournament</h2>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Score Hero ⚽</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-1">Tournament Name</label>
          <input value={tName} onChange={e => setTName(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:border-yellow-500" />
        </div>

        <div>
          <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Teams</label>
          <div className="grid grid-cols-4 gap-2">
            {([4, 8, 16, 32] as TournamentSize[]).map(s => (
              <button key={s} onClick={() => setTSize(s)}
                className={`py-2 rounded-xl font-black text-sm transition-all border ${tSize === s ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-800 text-white border-white/10 hover:border-yellow-500/40"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">AI Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setTDifficulty(d)}
                className={`py-2 rounded-xl font-black text-[11px] uppercase transition-all border ${tDifficulty === d ? "bg-yellow-500 text-black border-yellow-500" : "bg-gray-800 text-white border-white/10 hover:border-yellow-500/40"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-1">Your Team Name</label>
          <input value={myTeamName} onChange={e => setMyTeamName(e.target.value)}
            className="w-full bg-gray-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-black focus:outline-none focus:border-yellow-500" />
        </div>

        <div>
          <label className="text-gray-400 text-[10px] uppercase tracking-widest font-black block mb-2">Team Colour</label>
          <div className="grid grid-cols-4 gap-2">
            {TEAM_COLORS.map((tc, i) => (
              <button key={i} onClick={() => setMyColorIdx(i)}
                className={`h-10 rounded-xl border-2 transition-all ${myColorIdx === i ? "border-yellow-400 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: tc.primary }} />
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleCreate}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all text-sm active:scale-95 flex items-center justify-center gap-2">
        <Trophy size={16} />
        Start Tournament ({tSize} Teams)
      </button>

      <p className="text-gray-600 text-[9px] text-center uppercase tracking-widest">
        You + {tSize - 1} AI opponents
      </p>
    </div>
  );
};

export default SoccerTournament;
