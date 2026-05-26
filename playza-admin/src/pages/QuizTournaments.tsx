import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import {
  MdAdd, MdRefresh, MdPlayArrow, MdPeople, MdQuestionMark,
  MdUpload, MdDelete, MdEdit, MdVisibility, MdClose,
  MdCheckCircle, MdTimer, MdEmojiEvents, MdBolt,
} from "react-icons/md";
import { Trophy, Crown, ChevronDown, Zap, Shield, Flame, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuizTournament {
  id: string;
  title: string;
  description: string;
  entry_fee: number;
  prize_pool: number;
  status: "draft" | "lobby" | "active" | "completed" | "cancelled";
  scheduled_at: string | null;
  started_at: string | null;
  player_count: number;
  question_count: number;
  current_round: number;
}

interface QuizQuestion {
  id: string;
  round_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  time_limit_secs: number;
  order_index: number;
  image_url?: string | null;
}

// ─── Round config ─────────────────────────────────────────────────────────────
const ROUND_META = [
  { round: 1, name: "Warm Up",        color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",  badge: "bg-green-500",  secs: 45, icon: <Star className="w-3.5 h-3.5" /> },
  { round: 2, name: "Rising",         color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/30",    badge: "bg-blue-500",   secs: 35, icon: <Zap className="w-3.5 h-3.5" /> },
  { round: 3, name: "Heat Up",        color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30",badge: "bg-orange-500", secs: 30, icon: <Flame className="w-3.5 h-3.5" /> },
  { round: 4, name: "Danger Zone",    color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",      badge: "bg-red-500",    secs: 25, icon: <Shield className="w-3.5 h-3.5" /> },
  { round: 5, name: "Final Showdown", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30",badge: "bg-purple-500", secs: 20, icon: <Crown className="w-3.5 h-3.5" /> },
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-slate-100 dark:bg-slate-800 text-slate-500" },
  lobby:     { label: "Lobby",     cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  active:    { label: "Live 🔴",   cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
  completed: { label: "Completed", cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 dark:bg-slate-800 text-slate-400" },
};

// ─── API helpers ──────────────────────────────────────────────────────────────
const api = {
  listTournaments: async (): Promise<QuizTournament[]> => {
    const { data } = await apiClient.get("/admin/quiz/tournaments");
    return data.data ?? [];
  },
  createTournament: async (payload: Partial<QuizTournament>) => {
    const { data } = await apiClient.post("/admin/quiz/tournaments", payload);
    return data.data;
  },
  updateTournament: async ({ id, ...payload }: Partial<QuizTournament> & { id: string }) => {
    const { data } = await apiClient.patch(`/admin/quiz/tournaments/${id}`, payload);
    return data.data;
  },
  startTournament: async (id: string) => {
    const { data } = await apiClient.post(`/admin/quiz/tournaments/${id}/start`);
    return data;
  },
  launchTournament: async (id: string) => {
    const { data } = await apiClient.post(`/admin/quiz/tournaments/${id}/launch`);
    return data;
  },
  getQuestions: async (id: string): Promise<QuizQuestion[]> => {
    const { data } = await apiClient.get(`/admin/quiz/tournaments/${id}/questions`);
    return data.data ?? [];
  },
  addQuestion: async (tournamentId: string, q: Partial<QuizQuestion>) => {
    const { data } = await apiClient.post(`/admin/quiz/tournaments/${tournamentId}/questions`, q);
    return data.data;
  },
  bulkImport: async (tournamentId: string, questions: Partial<QuizQuestion>[]) => {
    const { data } = await apiClient.post(`/admin/quiz/tournaments/${tournamentId}/questions/bulk`, { questions });
    return data;
  },
  deleteQuestion: async (qId: string) => {
    await apiClient.delete(`/admin/quiz/questions/${qId}`);
  },
  getLive: async (id: string) => {
    const { data } = await apiClient.get(`/admin/quiz/tournaments/${id}/live`);
    return data.data;
  },
};

// ─── Create Tournament Modal ──────────────────────────────────────────────────
function CreateTournamentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", entry_fee: 0, scheduled_at: "" });
  const [error, setError] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.createTournament({
      title: form.title,
      description: form.description,
      entry_fee: Number(form.entry_fee),
      scheduled_at: form.scheduled_at || null,
    } as any),
    onSuccess: () => { onCreated(); onClose(); },
    onError: (err: any) => setError(err.response?.data?.message ?? "Failed to create"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-black text-foreground flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> New Tournament</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><MdClose /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2 text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

          {[
            { label: "Title *", key: "title", type: "text", placeholder: "Quiz Championship #1" },
            { label: "Description", key: "description", type: "text", placeholder: "Test your knowledge..." },
            { label: "Entry Fee (ZA Tokens)", key: "entry_fee", type: "number", placeholder: "0 = Free" },
            { label: "Scheduled At (optional)", key: "scheduled_at", type: "datetime-local", placeholder: "" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <button
            onClick={() => mutate()}
            disabled={isPending || !form.title}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <><MdRefresh className="animate-spin" /> Creating...</> : <><MdAdd /> Create Tournament</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Manager Modal ───────────────────────────────────────────────────
function QuestionManagerModal({ tournament, onClose }: { tournament: QuizTournament; onClose: () => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeRound, setActiveRound] = useState(1);
  const [addMode, setAddMode] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [newQ, setNewQ] = useState({
    question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", image_url: "",
  });

  const { data: questions = [], refetch } = useQuery({
    queryKey: ["admin-quiz-questions", tournament.id],
    queryFn: () => api.getQuestions(tournament.id),
  });

  const { mutate: addQ, isPending: adding } = useMutation({
    mutationFn: () => api.addQuestion(tournament.id, { ...newQ, round_number: activeRound, image_url: newQ.image_url?.trim() || null }),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] });
      setNewQ({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", image_url: "" });
      setAddMode(false);
    },
  });

  const { mutate: deleteQ } = useMutation({
    mutationFn: api.deleteQuestion,
    onSuccess: () => { refetch(); queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] }); },
  });

  const { mutate: bulkImport, isPending: importing } = useMutation({
    mutationFn: (qs: Partial<QuizQuestion>[]) => api.bulkImport(tournament.id, qs),
    onSuccess: (data) => {
      setImportSuccess(`Imported ${data.data?.length ?? 0} questions successfully!`);
      setImportError("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] });
      setTimeout(() => setImportSuccess(""), 4000);
    },
    onError: (err: any) => setImportError(err.response?.data?.message ?? "Import failed"),
  });

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const qs = Array.isArray(parsed) ? parsed : parsed.questions;
        if (!Array.isArray(qs)) throw new Error("Expected an array of questions");
        bulkImport(qs);
      } catch (err: any) {
        setImportError(err.message ?? "Invalid JSON format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const roundQuestions = questions.filter(q => q.round_number === activeRound);
  const roundMeta = ROUND_META[activeRound - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-black text-foreground">{tournament.title} — Questions</h3>
            <p className="text-xs text-muted-foreground">{questions.length} total questions</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
            >
              <MdUpload className={importing ? "animate-spin" : ""} />
              {importing ? "Importing..." : "Import JSON"}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><MdClose /></button>
          </div>
        </div>

        {/* Status messages */}
        {(importError || importSuccess) && (
          <div className={`mx-5 mt-4 px-4 py-2.5 rounded-xl text-sm font-medium border ${
            importSuccess ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400" :
            "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
          }`}>
            {importSuccess || importError}
          </div>
        )}

        {/* JSON format hint */}
        <div className="mx-5 mt-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl px-4 py-2.5 shrink-0">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">JSON Import Format</p>
          <code className="text-[10px] text-muted-foreground font-mono leading-relaxed">
            {`[{"round_number":1,"question_text":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_option":"A"}]`}
          </code>
        </div>

        {/* Round tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-border shrink-0 overflow-x-auto">
          {ROUND_META.map(r => {
            const count = questions.filter(q => q.round_number === r.round).length;
            return (
              <button
                key={r.round}
                onClick={() => { setActiveRound(r.round); setAddMode(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                  activeRound === r.round ? r.bg : "bg-muted border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={activeRound === r.round ? r.color : ""}>{r.icon}</span>
                <span className={activeRound === r.round ? r.color : ""}>{r.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${activeRound === r.round ? r.badge + " text-white" : "bg-muted-foreground/20 text-muted-foreground"}`}>
                  {count}/{r.secs}s
                </span>
              </button>
            );
          })}
        </div>

        {/* Question list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {roundQuestions.length === 0 && !addMode ? (
            <div className="py-12 text-center text-muted-foreground">
              <MdQuestionMark className="text-4xl mx-auto mb-2 opacity-30" />
              <p className="font-bold text-sm">No questions for {roundMeta?.name} yet</p>
              <p className="text-xs opacity-60 mt-1">Add one below or import a JSON file</p>
            </div>
          ) : (
            roundQuestions.map((q, i) => (
              <div key={q.id} className="bg-muted/40 border border-border rounded-xl p-3.5 group hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-muted-foreground">Q{i + 1}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${roundMeta?.badge} text-white`}>{roundMeta?.name}</span>
                      <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-0.5"><MdTimer className="text-xs" />{q.time_limit_secs}s</span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-2 leading-snug">{q.question_text}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["A", "B", "C", "D"] as const).map(opt => (
                        <div key={opt} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                          q.correct_option === opt ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black" : "text-muted-foreground"
                        }`}>
                          <span className={`font-black text-[10px] ${q.correct_option === opt ? "text-emerald-500" : "text-muted-foreground/50"}`}>{opt}</span>
                          {(q as any)[`option_${opt.toLowerCase()}`]}
                          {q.correct_option === opt && <MdCheckCircle className="ml-auto text-emerald-500 shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQ(q.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center transition-all hover:bg-red-200 shrink-0 mt-0.5"
                  >
                    <MdDelete className="text-sm" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Add question form */}
          {addMode && (
            <div className={`border rounded-2xl p-4 space-y-3 ${roundMeta?.bg}`}>
              <p className="text-xs font-black text-foreground uppercase tracking-wider">Add Question — {roundMeta?.name}</p>
              <textarea
                rows={2}
                placeholder="Question text..."
                value={newQ.question_text}
                onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              {/* Optional image URL */}
              <div>
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                  Image URL <span className="font-normal normal-case text-muted-foreground/40">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.png"
                  value={newQ.image_url}
                  onChange={e => setNewQ(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {newQ.image_url && (
                  <img
                    src={newQ.image_url} alt="preview"
                    className="mt-2 w-full max-h-28 object-cover rounded-xl border border-border"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(["a", "b", "c", "d"] as const).map(k => (
                  <div key={k} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">{k}</span>
                    <input
                      type="text"
                      placeholder={`Option ${k.toUpperCase()}`}
                      value={(newQ as any)[`option_${k}`]}
                      onChange={e => setNewQ(p => ({ ...p, [`option_${k}`]: e.target.value }))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mr-2">Correct:</label>
                  <select
                    value={newQ.correct_option}
                    onChange={e => setNewQ(p => ({ ...p, correct_option: e.target.value }))}
                    className="appearance-none px-3 py-2 pr-7 rounded-xl bg-card border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {["A", "B", "C", "D"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
                <button
                  onClick={() => addQ()}
                  disabled={adding || !newQ.question_text || !newQ.option_a || !newQ.option_b || !newQ.option_c || !newQ.option_d}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {adding ? <MdRefresh className="animate-spin" /> : <MdAdd />}
                  {adding ? "Adding..." : "Add Question"}
                </button>
                <button onClick={() => setAddMode(false)} className="px-3 py-2 rounded-xl bg-muted text-muted-foreground font-bold text-xs hover:bg-muted/80">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!addMode && (
          <div className="px-5 py-3 border-t border-border shrink-0">
            <button
              onClick={() => setAddMode(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:border-primary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
            >
              <MdAdd /> Add Question to {roundMeta?.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Live Monitor Modal ───────────────────────────────────────────────────────
function LiveMonitorModal({ tournament, onClose }: { tournament: QuizTournament; onClose: () => void }) {
  const { data: live, isLoading } = useQuery({
    queryKey: ["admin-quiz-live", tournament.id],
    queryFn: () => api.getLive(tournament.id),
    refetchInterval: 3000,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-black text-foreground">Live Monitor — {tournament.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><MdClose /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl mr-2" /> Loading live data...
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Round", value: live?.tournament?.current_round ?? 0, color: "text-primary" },
                  { label: "Alive", value: live?.stats?.alive ?? 0, color: "text-green-500" },
                  { label: "Eliminated", value: live?.stats?.eliminated ?? 0, color: "text-red-500" },
                ].map(s => (
                  <div key={s.label} className="bg-muted/50 rounded-2xl p-4 border border-border text-center">
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Leaderboard */}
              <div className="bg-muted/30 rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Live Leaderboard</p>
                </div>
                <div className="divide-y divide-border">
                  {live?.leaderboard?.slice(0, 20).map((entry: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-sm font-black text-muted-foreground w-5 text-center">
                        {i === 0 ? "👑" : i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                        {entry.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{entry.username}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.correct_answers} correct</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        entry.status === "winner" ? "bg-yellow-400" :
                        entry.status === "alive" ? "bg-green-400" : "bg-red-500"
                      }`} />
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        entry.status === "winner" ? "bg-yellow-100 text-yellow-700" :
                        entry.status === "alive" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const QuizTournaments: React.FC = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [manageQ, setManageQ] = useState<QuizTournament | null>(null);
  const [monitor, setMonitor] = useState<QuizTournament | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const { data: tournaments = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-quiz-tournaments"],
    queryFn: api.listTournaments,
  });

  const { mutate: startT } = useMutation({
    mutationFn: api.startTournament,
    onSuccess: (data) => {
      setActionMsg(data.message ?? "Tournament opened to lobby");
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] });
      setTimeout(() => setActionMsg(""), 4000);
    },
  });

  const { mutate: launchT } = useMutation({
    mutationFn: api.launchTournament,
    onSuccess: () => {
      setActionMsg("Game launched! Questions are broadcasting via WebSocket.");
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] });
      setTimeout(() => setActionMsg(""), 5000);
    },
  });

  return (
    <div className="p-4 space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md shadow-primary/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Quiz Tournaments</h1>
            <p className="text-sm text-muted-foreground font-medium">Create, manage, and monitor live quiz games</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-bold transition-all">
            <MdRefresh className={`text-lg ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:bg-primary/90 transition-all"
          >
            <MdAdd className="text-lg" /> New Tournament
          </button>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
          <MdCheckCircle className="text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{actionMsg}</p>
        </div>
      )}

      {/* Tournament cards */}
      {isLoading ? (
        <div className="py-16 flex items-center justify-center text-muted-foreground">
          <MdRefresh className="animate-spin text-2xl mr-2" /> Loading tournaments...
        </div>
      ) : tournaments.length === 0 ? (
        <div className="py-20 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="font-black text-foreground text-xl mb-2">No tournaments yet</p>
          <p className="text-muted-foreground text-sm mb-6">Create your first quiz tournament to get started</p>
          <button onClick={() => setCreateOpen(true)} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm">
            <MdAdd className="inline mr-1" /> Create Tournament
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tournaments.map(t => {
            const sc = STATUS_CFG[t.status];
            return (
              <div key={t.id} className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden hover:border-primary/20 transition-all">
                {/* Card header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-black text-foreground text-base leading-tight flex-1">{t.title}</h3>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${sc.cls}`}>{sc.label}</span>
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>}

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MdPeople className="text-sm" />
                      <span className="font-bold">{t.player_count}</span>
                      <span>players</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MdQuestionMark className="text-sm" />
                      <span className="font-bold">{t.question_count}</span>
                      <span>questions</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MdEmojiEvents className="text-sm" />
                      <span className="font-bold">{t.prize_pool.toLocaleString()}</span>
                      <span>ZA prize</span>
                    </div>
                    {t.entry_fee > 0 && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MdBolt className="text-sm" />
                        <span className="font-bold">{t.entry_fee}</span>
                        <span>ZA entry</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Round progress dots */}
                <div className="px-5 py-3 flex items-center gap-2 border-b border-border">
                  {ROUND_META.map(r => (
                    <div key={r.round} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        t.status === "active" && t.current_round === r.round ? r.badge + " animate-pulse" :
                        t.status === "completed" || (t.status === "active" && t.current_round > r.round) ? r.badge :
                        "bg-muted-foreground/20"
                      }`} />
                      <span className={`text-[9px] font-bold hidden sm:block ${
                        t.status === "active" && t.current_round === r.round ? r.color : "text-muted-foreground/40"
                      }`}>{r.name}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setManageQ(t)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all"
                  >
                    <MdEdit className="text-sm" /> Questions
                  </button>

                  {t.status === "active" && (
                    <button
                      onClick={() => setMonitor(t)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                    >
                      <MdVisibility className="text-sm" /> Monitor Live
                    </button>
                  )}

                  {t.status === "draft" && (
                    <button
                      onClick={() => startT(t.id)}
                      disabled={t.question_count < 5}
                      title={t.question_count < 5 ? "Add at least 5 questions first" : ""}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MdPlayArrow className="text-sm" /> Open Lobby
                    </button>
                  )}

                  {t.status === "lobby" && (
                    <button
                      onClick={() => launchT(t.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-xs font-black hover:opacity-90 transition-all shadow-md shadow-primary/20"
                    >
                      <Zap className="w-3.5 h-3.5" /> Launch Game Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateTournamentModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ["admin-quiz-tournaments"] })}
        />
      )}
      {manageQ && <QuestionManagerModal tournament={manageQ} onClose={() => setManageQ(null)} />}
      {monitor && <LiveMonitorModal tournament={monitor} onClose={() => setMonitor(null)} />}
    </div>
  );
};

export default QuizTournaments;
