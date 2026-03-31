import { useState, useEffect, useCallback } from "react";
import { Bell, Swords, Zap, Users, Trophy } from "lucide-react";
import { useToast } from "@/context/toast";
import { useNavigate } from "react-router";
import { getWaitingRooms } from "@/api/chess.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ZASymbol } from "./currency/ZASymbol";
import { useAuth } from "@/context/auth";
import { type RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/config/supabase";

interface ChessRoomRow {
  id: string;
  host_id: string;
  status: string;
  stake: number;
}

interface WaitingRoom {
  id: string;
  code: string;
  stake: number;
  created_at: string;
  host: {
    username: string;
    avatar_url: string | null;
  };
}

const H2HNotification = () => {
  const [waitingRooms, setWaitingRooms] = useState<WaitingRoom[]>([]);
  const [hasNew, setHasNew] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const fetchRooms = useCallback(async () => {
    try {
      const rooms = await getWaitingRooms();
      setWaitingRooms(rooms);
    } catch (err) {
      console.error("Failed to fetch waiting rooms", err);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await fetchRooms();
    };
    initFetch();
  }, [fetchRooms]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("h2h-lobby")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chess_rooms",
          filter: "status=eq.waiting",
        },
        (payload: RealtimePostgresChangesPayload<ChessRoomRow>) => {
          console.log("New challenge detected!", payload);
          fetchRooms();

          // Only show toast if it's a new room being created AND it's not by me
          if (
            payload.new &&
            "host_id" in payload.new &&
            payload.new.host_id !== user?.id
          ) {
            setHasNew(true);
            toast.info("A new challenger has entered the arena!");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chess_rooms",
        },
        (payload: RealtimePostgresChangesPayload<ChessRoomRow>) => {
          if (
            payload.new &&
            "status" in payload.new &&
            payload.new.status !== "waiting"
          ) {
            // Room is now active or finished, remove from list
            fetchRooms();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms, toast, user?.id]);

  const handleJoin = (roomId: string) => {
    setHasNew(false);
    setOpen(false);
    navigate(`/h2h/${roomId}`);
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (val) setHasNew(false);
      }}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <button className="relative p-1.5 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group">
          <Bell
            className={`w-4 h-4 md:w-5 md:h-5 ${hasNew ? "text-primary animate-bounce" : "text-slate-500"}`}
          />
          {waitingRooms.length > 0 && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-3.5 w-3.5 md:h-4 md:w-4">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasNew ? "bg-primary" : "bg-indigo-400"}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center text-[7px] md:text-[8px] font-black text-white ${hasNew ? "bg-primary" : "bg-indigo-500"}`}
              >
                {waitingRooms.length}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 md:w-80 glass bg-white/95 dark:bg-slate-900/95 border-primary/20 p-0 overflow-hidden mt-2 z-100 mr-2 md:mr-0"
      >
        <div className="p-3 md:p-4 border-b border-primary/10 bg-linear-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Live Challenges
            </h3>
            <div className="flex gap-1">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[7px] md:text-[8px] font-bold text-primary uppercase">
                Real-time
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-100 overflow-y-auto no-scrollbar py-2">
          {waitingRooms.length === 0 ? (
            <div className="py-8 md:py-12 flex flex-col items-center justify-center text-center px-4 md:px-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-slate-300 dark:text-slate-700" />
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-tight">
                No active rivals
                <br />
                looking for battle
              </p>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/h2h");
                }}
                className="mt-3 md:mt-4 text-[8px] md:text-[9px] font-black uppercase text-primary border-b border-primary/30 hover:border-primary pb-0.5"
              >
                Start your challenge
              </button>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {waitingRooms.map((room) => (
                <DropdownMenuItem
                  key={room.id}
                  onClick={() => handleJoin(room.id)}
                  className="flex items-center gap-2.5 md:gap-3 p-2 md:p-3 rounded-xl cursor-pointer hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/20"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-primary/20 overflow-hidden bg-slate-100 shrink-0">
                    {room.host.avatar_url ? (
                      <img
                        src={room.host.avatar_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 font-black text-primary text-[10px] md:text-sm">
                        {room.host.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-slate-900 dark:text-white uppercase truncate">
                        {room.host.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <div className="flex items-center gap-1 bg-amber-500/10 px-1 md:px-1.5 py-0.5 rounded-md">
                        <Trophy className="w-2 md:w-2.5 h-2 md:h-2.5 text-amber-500" />
                        <span className="text-[9px] md:text-[10px] font-black text-amber-600 dark:text-amber-400 tracking-tighter">
                          {room.stake}{" "}
                          <ZASymbol className="inline-block w-1.5 h-1.5 md:w-2 md:h-2" />
                        </span>
                      </div>
                      <span className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase">
                        Chess · Pro
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary text-slate-900 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Swords className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setOpen(false);
            navigate("/h2h");
          }}
          className="w-full py-2.5 md:py-3 bg-slate-50 dark:bg-white/5 border-t border-primary/10 flex items-center justify-center gap-2 group"
        >
          <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
          <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 group-hover:text-primary transition-colors">
            Enter H2H Battles Arena
          </span>
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default H2HNotification;
