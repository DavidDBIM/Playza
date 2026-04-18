import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  MdTrendingUp, 
  MdBolt, 
  MdSettings, 
  MdIosShare, 
  MdContentCopy,
  MdFilterList,
  MdMoreVert,
  MdArrowDropUp,
  MdArrowDropDown,
  MdCircle,
  MdCheck
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';

const Session: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sessionStatus, setSessionStatus] = useState('Live');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statuses = ['Live', 'Ongoing', 'Upcoming', 'Ended'];

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-8">
        {/* Hero Session Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-400/30">
              <MdTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  Midnight Qualifier
                </h1>
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black tracking-wider uppercase rounded-lg border border-emerald-500/20 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Session ID: #{id || "PX-992-ALPHA"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Custom Dropdown */}
            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-10 px-4 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-3 cursor-pointer hover:bg-muted/80 transition-all"
              >
                <div className="flex items-center gap-2">
                  {sessionStatus === "Live" && (
                    <MdCircle className="text-[10px] text-emerald-500 animate-pulse" />
                  )}
                  {sessionStatus}
                </div>
                <MdArrowDropDown
                  className={`text-lg transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-11 right-0 w-32 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 flex flex-col">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSessionStatus(status);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {status === "Live" && (
                          <MdCircle className="text-[8px] text-emerald-500" />
                        )}
                        <span
                          className={
                            sessionStatus === status
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        >
                          {status}
                        </span>
                      </div>
                      {sessionStatus === status && (
                        <MdCheck className="text-primary text-xs" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() =>
                navigate(`/sessions/${id || "PX-992-ALPHA"}/leaderboard`)
              }
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-primary transition-all"
            >
              Track Match
            </button>
            <button className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all">
              Push Live
            </button>
            <button
              onClick={() => navigate("/games")}
              className="px-4 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-xl text-xs font-bold transition-all"
            >
              Terminate
            </button>
          </div>
        </div>

        {/* Top Level Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Active Roster",
              value: "124",
              sub: "Max Players: 200",
              color: "text-foreground",
              primaryLine: true,
            },
            {
              label: "Gross Pool",
              value: "186,000",
              sub: "Total Base",
              color: "text-muted-foreground",
            },
            {
              label: "Net Prize Pool",
              value: "167,400",
              sub: "After Fee",
              color: "text-emerald-500",
            },
            {
              label: "Winners Split",
              value: "20",
              sub: "Paid Winners",
              color: "text-primary",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                {stat.label}
              </p>
              <div className="flex flex-col">
                <span
                  className={`text-2xl font-black tracking-tight font-number ${stat.color}`}
                >
                  {stat.value}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tight">
                  {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Control Grid */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Player List (8/12) */}
          <div className="col-span-1 xl:col-span-8 space-y-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Active Roster
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground font-black uppercase tracking-wider text-[10px] flex items-center gap-2 hover:text-foreground"
                >
                  <MdFilterList className="text-base" /> Filter Roster
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50 border-b border-border">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">
                        Player
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">
                        Score
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest text-center h-auto font-black text-muted-foreground">
                        Rank
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest h-auto font-black text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="px-6 py-3 text-[10px] uppercase tracking-widest text-right h-auto font-black text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {[
                      {
                        name: "NeoKnight_99",
                        region: "EUW",
                        score: "14,290",
                        rank: "#01",
                        color: "text-primary",
                      },
                      {
                        name: "Z-Void_Runner",
                        region: "USE",
                        score: "13,842",
                        rank: "#02",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Loxley_Prime",
                        region: "ASIA",
                        score: "12,100",
                        rank: "#03",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Quantum_Gabe",
                        region: "USW",
                        score: "11,540",
                        rank: "#04",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Redux_Master",
                        region: "EUW",
                        score: "11,400",
                        rank: "#05",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Echo_Shift",
                        region: "OCE",
                        score: "10,950",
                        rank: "#06",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Frost_Bite",
                        region: "SA",
                        score: "10,800",
                        rank: "#07",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Titan_Fall",
                        region: "AFR",
                        score: "10,500",
                        rank: "#08",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Viper_Strike",
                        region: "USE",
                        score: "10,200",
                        rank: "#09",
                        color: "text-muted-foreground",
                      },
                      {
                        name: "Nova_Burst",
                        region: "EUW",
                        score: "9,980",
                        rank: "#10",
                        color: "text-muted-foreground",
                      },
                    ].map((player, i) => (
                      <TableRow
                        key={i}
                        className="hover:bg-muted/30 transition-colors border-none"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-sm text-foreground uppercase tracking-tight">
                                {player.name}
                              </p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                                Region: {player.region}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center font-black text-foreground text-base font-number">
                          {player.score}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center font-number">
                          <span
                            className={`font-black italic text-sm ${player.color}`}
                          >
                            {player.rank}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                            <MdCircle className="text-[8px] animate-pulse" />{" "}
                            Live
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          >
                            <MdMoreVert className="text-xl" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-3 bg-muted/30 text-center border-t border-border">
                <button
                  onClick={() =>
                    navigate(`/sessions/${id || "PX-992-ALPHA"}/leaderboard`)
                  }
                  className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all"
                >
                  Show All 128 Players
                </button>
              </div>
            </div>
          </div>

          {/* Right Rail: Live Ranking & Events (4/12) */}
          <div className="col-span-1 xl:col-span-4 space-y-6">
            {/* Live Ranking Module */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center justify-between">
                Live Ranking
                <MdTrendingUp className="text-xl text-primary" />
              </h2>
              <div className="space-y-3">
                {[
                  {
                    rank: 1,
                    name: "NeoKnight_99",
                    score: "14,290",
                    trend: "up",
                  },
                  {
                    rank: 2,
                    name: "Z-Void_Runner",
                    score: "13,842",
                    trend: "down",
                  },
                  {
                    rank: 3,
                    name: "Loxley_Prime",
                    score: "12,100",
                    trend: "stable",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${item.rank === 1 ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"}`}
                  >
                    <span
                      className={`font-black italic w-6 text-xl font-number ${item.rank === 1 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {item.rank}
                    </span>
                    <div className="flex-1">
                      <p className="font-black text-xs text-foreground uppercase tracking-tight">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 font-number">
                        {item.score} PTS
                      </p>
                    </div>
                    {item.trend === "up" && (
                      <MdArrowDropUp className="text-emerald-500 text-2xl" />
                    )}
                    {item.trend === "down" && (
                      <MdArrowDropDown className="text-rose-500 text-2xl" />
                    )}
                    {item.trend === "stable" && (
                      <span className="w-4 h-0.5 bg-border rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-100">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center justify-between">
                Live Feed
                <MdBolt className="text-xl text-amber-500" />
              </h2>
              <div className="flex-1 overflow-y-auto space-y-5 custom-scrollbar">
                {[
                  {
                    time: "14:52:10",
                    tag: "System",
                    msg: "Round 4 initialized.",
                    color: "text-amber-500",
                  },
                  {
                    time: "14:51:04",
                    tag: "Player",
                    msg: "NeoKnight_99 multiplier high.",
                    color: "text-primary",
                  },
                  {
                    time: "14:48:33",
                    tag: "Economy",
                    msg: "Pool: ₦42,500.",
                    color: "text-emerald-500",
                  },
                  {
                    time: "14:45:12",
                    tag: "Traffic",
                    msg: "Spec count: 1.2k.",
                    color: "text-muted-foreground",
                  },
                ].map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1.5 w-1 h-3 rounded-full bg-border shrink-0"></div>
                    <div>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-0.5 font-number">
                        {log.time}
                      </p>
                      <p className="text-xs font-bold leading-relaxed text-foreground">
                        <span
                          className={`${log.color} uppercase tracking-tight mr-1`}
                        >
                          {log.tag}:
                        </span>
                        <span>{log.msg}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-x-10 gap-y-4">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">
                Session Target
              </p>
              <p className="text-sm font-black text-foreground uppercase tracking-tight">
                Qualifier Stage
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">
                Public Link
              </p>
              <p className="text-sm font-black text-primary flex items-center justify-center xl:justify-start gap-2 cursor-pointer uppercase tracking-tight hover:underline">
                playza.live/match/mx-992
                <MdContentCopy className="text-xs text-muted-foreground" />
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                Engine State
              </p>
              <div className="flex items-center justify-center xl:justify-start gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-3.5 h-1.5 bg-emerald-500 rounded-full"
                  ></span>
                ))}
                <span className="text-[10px] font-black text-emerald-500 uppercase ml-1.5 tracking-wider">
                  Normal
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full xl:w-auto">
            <Button
              variant="outline"
              className="flex-1 xl:flex-none h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border-border text-muted-foreground hover:bg-muted"
            >
              <MdSettings className="text-base" /> Settings
            </Button>
            <Button
              variant="outline"
              className="flex-1 xl:flex-none h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider border-border text-muted-foreground hover:bg-muted"
            >
              <MdIosShare className="text-base" /> Export Logs
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Session;
