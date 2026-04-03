import { useState, useEffect } from "react";
import { Bell, Swords, Zap, Users } from "lucide-react";
import { useToast } from "@/context/toast";
import { useNavigate } from "react-router";
import { getWaitingRooms } from "@/api/chess.api";
import { ZASymbol } from "../currency/ZASymbol";
import { useAuth } from "@/context/auth";
import { type RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/config/supabase";
import { timeAgo } from "@/utils/time-ago";
import { createPortal } from "react-dom";

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


  useEffect(() => {
    let mounted = true;

    const loadRooms = async () => {
      try {
        const rooms = await getWaitingRooms();
        if (mounted) {
          setWaitingRooms(rooms);
        }
      } catch (err) {
        console.error("Failed to fetch waiting rooms", err);
      }
    };

    loadRooms();

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
          loadRooms();
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
            loadRooms();
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [toast, user?.id]);

  const handleJoin = (roomId: string) => {
    setHasNew(false);
    setOpen(false);
    navigate(`/h2h/${roomId}`);
  };

  return (
    <>
      <button 
        onClick={() => {
          setOpen(true);
          setHasNew(false);
        }}
        className="relative p-1.5 md:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 group flex items-center justify-center outline-none"
      >
        <Bell
          className={`w-4 h-4 md:w-5 md:h-5 ${hasNew ? "text-indigo-500 font-black" : "text-slate-500"}`}
        />
        {waitingRooms.length > 0 && (
          <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-3.5 w-3.5 md:h-4 md:w-4">
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center text-[8px] md:text-[10px] font-black text-white ${hasNew ? "bg-indigo-500" : "bg-indigo-600"}`}
            >
              {waitingRooms.length}
            </span>
          </span>
        )}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 border-2 border-primary/30 rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-black/5 dark:border-white/5 relative">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Bell size={64} className="text-slate-900 dark:text-white" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/60 mb-1 whitespace-nowrap italic">Live Combat Arena</p>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                    RIBOSE <span className="text-indigo-500">LOBBY</span>
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[50vh] overflow-y-auto scrollbar-hide p-2 md:p-4 space-y-3">
              {waitingRooms.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-dashed border-black/10 dark:border-white/10 text-slate-500">
                    <Users size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                      Zero Hostilities
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic leading-tight">
                      Waiting for challengers...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {waitingRooms.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => handleJoin(room.id)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-slate-800/50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 bg-slate-900">
                          {room.host.avatar_url ? (
                            <img
                              src={room.host.avatar_url}
                              alt={room.host.username}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black text-sm">
                              {room.host.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <span className="block text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-30 italic leading-none mb-1">{room.host.username}</span>
                          <span className="block text-[10px] font-bold text-indigo-400/50 uppercase tracking-[0.2em]">{timeAgo(room.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-[10px] md:text-sm font-black text-indigo-500 italic">
                            {room.stake} <ZASymbol className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter block leading-none">STAKE</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-slate-950">
                          <Swords size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-5 bg-black/5 dark:bg-slate-950/50 border-t border-black/5 dark:border-white/5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white italic"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/h2h");
                }}
                className="flex-2 py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] italic flex items-center justify-center gap-3"
              >
                <Zap size={14} className="fill-current" />
                GO TO ARENA
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default H2HNotification;

