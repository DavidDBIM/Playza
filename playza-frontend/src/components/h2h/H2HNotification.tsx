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
        className="relative p-1.5 md:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group flex items-center justify-center outline-none"
      >
        <Bell
          className={`w-4 h-4 md:w-5 md:h-5 ${hasNew ? "text-indigo-500 animate-bounce font-black" : "text-slate-500"}`}
        />
        {waitingRooms.length > 0 && (
          <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-3.5 w-3.5 md:h-4 md:w-4">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasNew ? "bg-indigo-500" : "bg-indigo-400"}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center text-[7px] md:text-[8px] font-black text-white ${hasNew ? "bg-indigo-500" : "bg-indigo-600"}`}
            >
              {waitingRooms.length}
            </span>
          </span>
        )}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-9999 flex items-start justify-center sm:items-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-4 transition-all duration-300 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-white/5 bg-linear-to-b from-indigo-500/10 to-transparent relative">
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <Bell size={64} className="text-white" />
              </div>
              <div className="relative z-10 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-1 whitespace-nowrap italic">Live Combat Arena</p>
                <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter leading-none">
                    RIBOSE <span className="text-indigo-500">LOBBY</span>
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-[50vh] overflow-y-auto scrollbar-hide p-3 md:p-4 space-y-3">
              {waitingRooms.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-dashed border-white/10 text-slate-500">
                    <Users size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-widest italic">
                      Zero Hostilities
                    </p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-tight">
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
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shadow-inner">
                          {room.host.avatar_url ? (
                            <img
                              src={room.host.avatar_url}
                              alt={room.host.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-black text-sm">
                              {room.host.username[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="text-left">
                          <span className="block text-[12px] font-black text-white uppercase tracking-tight truncate max-w-30 italic leading-none mb-1">{room.host.username}</span>
                          <span className="block text-[8px] font-bold text-indigo-400/50 uppercase tracking-[0.2em]">{timeAgo(room.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1.5 text-[14px] font-black text-indigo-400 italic">
                            {room.stake} <ZASymbol className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[7px] text-slate-600 font-black uppercase tracking-tighter block leading-none">STAKE</span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-slate-900 group-hover:bg-white transition-colors shadow-lg shadow-indigo-500/20">
                          <Swords size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-5 bg-slate-950/50 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all italic border border-transparent hover:border-white/10"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/h2h");
                }}
                className="flex-2 py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] italic shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 border border-indigo-400/50"
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

