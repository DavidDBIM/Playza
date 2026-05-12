import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import {
  MdSearch, MdRefresh, MdCheckCircle, MdCancel, MdPending,
  MdOpenInNew, MdZoomIn, MdAdd, MdEdit, MdDelete, MdClose,
  MdLink, MdVisibility, MdVisibilityOff,
} from "react-icons/md";
import { FaXTwitter, FaYoutube, FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa6";
import { SiMedium } from "react-icons/si";
import { Share2, ChevronDown, Settings, ListChecks } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TaskConfig {
  id: string;
  platform: string;
  action_type: string;
  title: string;
  description: string;
  target_url: string;
  points: number;
  is_active: boolean;
  created_at: string;
}

interface SocialTaskSubmission {
  id: string;
  user_id: string;
  task_id: string;
  screenshot_url: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  users?: { username: string; email: string };
}

interface SubmissionsResponse {
  submissions: SocialTaskSubmission[];
  total: number;
  page: number;
  pages: number;
}

// ─── Platform constants — plain strings, never dynamic ─────────────────────────

const PLATFORM_LIST = [
  { id: "twitter",   label: "X (Twitter)" },
  { id: "youtube",   label: "YouTube" },
  { id: "facebook",  label: "Facebook" },
  { id: "tiktok",    label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "medium",    label: "Medium" },
];

const PLATFORM_ACTIONS: Record<string, { value: string; label: string }[]> = {
  twitter:   [{ value: "follow", label: "Follow" }, { value: "like", label: "Like a Post" }, { value: "retweet", label: "Retweet" }, { value: "quote", label: "Quote Tweet" }, { value: "comment", label: "Comment / Reply" }],
  youtube:   [{ value: "subscribe", label: "Subscribe" }, { value: "like", label: "Like a Video" }, { value: "comment", label: "Comment on a Video" }],
  facebook:  [{ value: "like_page", label: "Like Page" }, { value: "share", label: "Share a Post" }, { value: "comment", label: "Comment on a Post" }],
  tiktok:    [{ value: "follow", label: "Follow" }, { value: "like", label: "Like a Video" }, { value: "comment", label: "Comment on a Video" }],
  instagram: [{ value: "follow", label: "Follow" }, { value: "like", label: "Like a Post" }, { value: "comment", label: "Comment on a Post" }],
  medium:    [{ value: "follow", label: "Follow" }, { value: "clap", label: "Clap on an Article" }],
};

// All styling as full plain strings — no dynamic interpolation anywhere
const PLT_TAB_ACTIVE: Record<string, string> = {
  twitter:   "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 shadow-sm",
  youtube:   "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 shadow-sm",
  facebook:  "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm",
  tiktok:    "bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm",
  instagram: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800 shadow-sm",
  medium:    "bg-stone-50 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 shadow-sm",
};

const PLT_HEADER_BG: Record<string, string> = {
  twitter:   "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800",
  youtube:   "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  facebook:  "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  tiktok:    "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700",
  instagram: "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800",
  medium:    "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-700",
};

const PLT_ICON_BG: Record<string, string> = {
  twitter:   "bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800",
  youtube:   "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
  facebook:  "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  tiktok:    "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700",
  instagram: "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800",
  medium:    "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-700",
};

const PLT_TEXT: Record<string, string> = {
  twitter:   "text-sky-600 dark:text-sky-400",
  youtube:   "text-red-600 dark:text-red-400",
  facebook:  "text-blue-600 dark:text-blue-400",
  tiktok:    "text-slate-800 dark:text-slate-200",
  instagram: "text-pink-600 dark:text-pink-400",
  medium:    "text-stone-700 dark:text-stone-300",
};

const PLT_BADGE: Record<string, string> = {
  twitter:   "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
  youtube:   "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  facebook:  "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  tiktok:    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  instagram: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  medium:    "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
};

const PLT_BTN: Record<string, string> = {
  twitter:   "bg-sky-500 text-white",
  youtube:   "bg-red-500 text-white",
  facebook:  "bg-blue-500 text-white",
  tiktok:    "bg-slate-700 text-white",
  instagram: "bg-pink-500 text-white",
  medium:    "bg-stone-700 text-white",
};

// ─── Platform Icon ─────────────────────────────────────────────────────────────

function PlatformIcon({ platform, className }: { platform: string; className: string }) {
  if (platform === "twitter")   return <FaXTwitter className={className} />;
  if (platform === "youtube")   return <FaYoutube className={className} />;
  if (platform === "facebook")  return <FaFacebook className={className} />;
  if (platform === "tiktok")    return <FaTiktok className={className} />;
  if (platform === "instagram") return <FaInstagram className={className} />;
  if (platform === "medium")    return <SiMedium className={className} />;
  return <Share2 className={className} />;
}

// ─── API helpers ───────────────────────────────────────────────────────────────

async function fetchConfigs(): Promise<TaskConfig[]> {
  const { data } = await apiClient.get("/admin/social-tasks/configs");
  return data.data;
}

async function createConfig(payload: Omit<TaskConfig, "id" | "created_at">): Promise<TaskConfig> {
  const { data } = await apiClient.post("/admin/social-tasks/configs", payload);
  return data.data;
}

async function updateConfig(id: string, payload: Partial<TaskConfig>): Promise<TaskConfig> {
  const { data } = await apiClient.patch("/admin/social-tasks/configs/" + id, payload);
  return data.data;
}

async function deleteConfig(id: string): Promise<void> {
  await apiClient.delete("/admin/social-tasks/configs/" + id);
}

async function fetchSubmissions(params: {
  page: number; limit: number; search: string; status: string; platform: string; task_config_id: string;
}): Promise<SubmissionsResponse> {
  const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search)         q.set("search", params.search);
  if (params.status)         q.set("status", params.status);
  if (params.platform)       q.set("platform", params.platform);
  if (params.task_config_id) q.set("task_config_id", params.task_config_id);
  const { data } = await apiClient.get("/admin/social-tasks?" + q.toString());
  return data.data;
}

async function reviewSubmission(p: { id: string; action: "approve" | "reject"; admin_note?: string }) {
  const { data } = await apiClient.post("/admin/social-tasks/" + p.id + "/review", { action: p.action, admin_note: p.admin_note });
  return data.data;
}

// ─── Task Form Modal ───────────────────────────────────────────────────────────

interface TaskFormProps {
  platformId: string;
  editing: TaskConfig | null;
  onClose: () => void;
}

function TaskFormModal({ platformId, editing, onClose }: TaskFormProps) {
  const queryClient = useQueryClient();
  const actions = PLATFORM_ACTIONS[platformId] ?? [];
  const pLabel = PLATFORM_LIST.find((p) => p.id === platformId)?.label ?? platformId;

  const [form, setForm] = useState({
    action_type: editing?.action_type ?? actions[0]?.value ?? "",
    title:       editing?.title ?? "",
    description: editing?.description ?? "",
    target_url:  editing?.target_url ?? "",
    points:      editing?.points ?? 200,
  });
  const [error, setError] = useState("");

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      editing
        ? updateConfig(editing.id, form)
        : createConfig({ ...form, platform: platformId, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "social-task-configs"] });
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim())       return setError("Title is required");
    if (!form.description.trim()) return setError("Description is required");
    if (!form.target_url.trim())  return setError("Target URL is required");
    save();
  }

  const headerCls = ["flex items-center justify-between px-5 py-4 border-b border-border", PLT_HEADER_BG[platformId] ?? ""].join(" ");
  const iconWrapCls = ["w-9 h-9 rounded-xl flex items-center justify-center border", PLT_ICON_BG[platformId] ?? ""].join(" ");
  const iconTxt = PLT_TEXT[platformId] ?? "text-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={headerCls}>
          <div className="flex items-center gap-3">
            <div className={iconWrapCls}>
              <PlatformIcon platform={platformId} className={["w-4 h-4", iconTxt].join(" ")} />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base">
                {editing ? "Edit Task" : "New " + pLabel + " Task"}
              </h3>
              <p className="text-xs text-muted-foreground">Appears on users' Loyalty page</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground">
            <MdClose className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">Action Type</label>
            <div className="relative">
              <select
                value={form.action_type}
                onChange={(e) => setForm((f) => ({ ...f, action_type: e.target.value }))}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">Task Title</label>
            <input
              type="text" placeholder="e.g. Retweet our launch post"
              value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">Description</label>
            <textarea
              rows={2} placeholder="Short instruction shown to the user"
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Target URL <span className="font-normal normal-case text-muted-foreground">(link user taps to complete the task)</span>
            </label>
            <div className="relative">
              <MdLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
              <input
                type="url" placeholder="https://x.com/playzadotgames/status/..."
                value={form.target_url} onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">PZA Reward</label>
            <input
              type="number" min={1} max={100000}
              value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: parseInt(e.target.value) || 200 }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-all">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-black transition-all disabled:opacity-50">
              {isPending ? "Saving…" : editing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Review Modal ──────────────────────────────────────────────────────────────

interface ReviewModalProps {
  submission: SocialTaskSubmission;
  configMap: Record<string, TaskConfig>;
  onClose: () => void;
  onDone: () => void;
}

function ReviewModal({ submission, configMap, onClose, onDone }: ReviewModalProps) {
  const [adminNote, setAdminNote] = useState(submission.admin_note ?? "");
  const [reviewError, setReviewError] = useState("");
  const [lightbox, setLightbox] = useState(false);
  const config = configMap[submission.task_id];

  const { mutate: doReview, isPending: reviewing } = useMutation({
    mutationFn: reviewSubmission,
    onSuccess: () => { onDone(); onClose(); },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Action failed";
      setReviewError(msg);
    },
  });

  const statusCls: Record<string, string> = {
    pending:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300",
  };
  const sc = statusCls[submission.status] ?? statusCls.pending;
  const actionLabel = config ? (PLATFORM_ACTIONS[config.platform]?.find((a) => a.value === config.action_type)?.label ?? config.action_type) : submission.task_id;
  const iconBgCls = config ? ["w-9 h-9 rounded-xl flex items-center justify-center border", PLT_ICON_BG[config.platform] ?? ""].join(" ") : "w-9 h-9 rounded-xl flex items-center justify-center border bg-muted";
  const iconTxtCls = config ? PLT_TEXT[config.platform] ?? "text-foreground" : "text-foreground";
  const badgeCls = config ? PLT_BADGE[config.platform] ?? "bg-muted text-foreground" : "bg-muted text-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            {config && (
              <div className={iconBgCls}>
                <PlatformIcon platform={config.platform} className={["w-4 h-4", iconTxtCls].join(" ")} />
              </div>
            )}
            <div>
              <h3 className="font-black text-foreground text-base">{submission.users?.username ?? "User"}</h3>
              <p className="text-xs text-muted-foreground">{submission.users?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground">
            <MdClose className="text-lg" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={["inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg", sc].join(" ")}>
              {submission.status}
            </span>
            {config && (
              <>
                <span className={["text-[10px] font-black px-2.5 py-1 rounded-lg", badgeCls].join(" ")}>
                  {PLATFORM_LIST.find((p) => p.id === config.platform)?.label ?? config.platform}
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">{actionLabel}</span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  +{config.points} PZA on approval
                </span>
              </>
            )}
          </div>

          {config && (
            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Task</p>
              <p className="text-sm font-bold text-foreground">{config.title}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          )}

          {submission.screenshot_url && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Screenshot</p>
              <button onClick={() => setLightbox(true)} className="w-full relative group/shot">
                <img src={submission.screenshot_url} alt="screenshot" className="w-full max-h-64 object-contain rounded-xl border border-border bg-muted group-hover/shot:opacity-80 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/shot:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-bold">
                    <MdZoomIn className="text-base" /> View Full Size
                  </span>
                </div>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-sm font-bold text-foreground">{new Date(submission.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            {submission.reviewed_at && (
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Reviewed</p>
                <p className="text-sm font-bold text-foreground">{new Date(submission.reviewed_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">Admin Note (optional)</label>
            <textarea
              rows={3} placeholder="Add a note visible to the user if rejected…"
              value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {reviewError && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{reviewError}</p>
            </div>
          )}

          {submission.status === "pending" ? (
            <div className="flex gap-3">
              <button
                onClick={() => doReview({ id: submission.id, action: "reject", admin_note: adminNote.trim() || undefined })}
                disabled={reviewing}
                className="flex-1 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-black text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MdCancel className="text-lg" /> {reviewing ? "…" : "Reject"}
              </button>
              <button
                onClick={() => doReview({ id: submission.id, action: "approve", admin_note: adminNote.trim() || undefined })}
                disabled={reviewing}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MdCheckCircle className="text-lg" /> {reviewing ? "…" : ("Approve (+" + (config?.points ?? 200) + " PZA)")}
              </button>
            </div>
          ) : (
            <div className={["py-3 rounded-xl text-center text-sm font-black", sc].join(" ")}>
              This submission has been {submission.status.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <MdClose className="text-xl" />
          </button>
          <img src={submission.screenshot_url} alt="full" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SocialTasks: React.FC = () => {
  const queryClient = useQueryClient();

  const [activePlatform, setActivePlatform] = useState("twitter");
  const [activeView, setActiveView] = useState<"tasks" | "submissions">("tasks");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaskConfig | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [selectedSub, setSelectedSub] = useState<SocialTaskSubmission | null>(null);

  const { data: allConfigs = [], isLoading: configsLoading, refetch: refetchConfigs } = useQuery({
    queryKey: ["admin", "social-task-configs"],
    queryFn: fetchConfigs,
  });

  const platformConfigs = allConfigs.filter((c) => c.platform === activePlatform);
  const configMap = Object.fromEntries(allConfigs.map((c) => [c.id, c]));

  const { data: subsData, isLoading: subsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ["admin", "social-tasks", page, search, statusFilter, taskFilter, activePlatform, activeView],
    queryFn: () => fetchSubmissions({ page, limit: 15, search, status: statusFilter, platform: activeView === "submissions" ? activePlatform : "", task_config_id: taskFilter }),
    enabled: activeView === "submissions",
  });

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteConfig,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "social-task-configs"] }); setDeleteConfirm(null); },
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateConfig(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "social-task-configs"] }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const spinning = configsLoading || subsLoading;
  const headerBg  = PLT_HEADER_BG[activePlatform] ?? "";
  const iconBg    = PLT_ICON_BG[activePlatform] ?? "";
  const iconTxt   = PLT_TEXT[activePlatform] ?? "text-foreground";
  const pText     = PLT_TEXT[activePlatform] ?? "text-foreground";
  const pBtn      = PLT_BTN[activePlatform] ?? "bg-primary text-primary-foreground";
  const pLabel    = PLATFORM_LIST.find((p) => p.id === activePlatform)?.label ?? activePlatform;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-400/30">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Social Tasks</h1>
            <p className="text-sm text-muted-foreground font-medium">Create tasks · review submissions</p>
          </div>
        </div>
        <button onClick={() => { refetchConfigs(); refetchSubs(); }} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all">
          <MdRefresh className={spinning ? "text-lg animate-spin" : "text-lg"} /> Refresh
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORM_LIST.map((p) => {
          const isActive = activePlatform === p.id;
          const tabCls = isActive
            ? ["flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border", PLT_TAB_ACTIVE[p.id] ?? ""].join(" ")
            : "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-muted text-muted-foreground border-transparent hover:bg-muted/80";
          const countBadge = isActive
            ? ["text-[10px] font-black px-1.5 py-0.5 rounded-md", PLT_BADGE[p.id] ?? ""].join(" ")
            : "text-[10px] font-black px-1.5 py-0.5 rounded-md bg-background text-muted-foreground";
          const taskCount = allConfigs.filter((c) => c.platform === p.id && c.is_active).length;
          return (
            <button key={p.id} onClick={() => { setActivePlatform(p.id); setPage(1); setTaskFilter(""); setSearch(""); setSearchInput(""); }} className={tabCls}>
              <PlatformIcon platform={p.id} className="w-4 h-4" />
              {p.label}
              {taskCount > 0 && <span className={countBadge}>{taskCount}</span>}
            </button>
          );
        })}
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button onClick={() => setActiveView("tasks")} className={activeView === "tasks" ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-card text-foreground shadow-sm" : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground"}>
          <Settings className="w-4 h-4" /> Manage Tasks
        </button>
        <button onClick={() => setActiveView("submissions")} className={activeView === "submissions" ? "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-card text-foreground shadow-sm" : "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground"}>
          <ListChecks className="w-4 h-4" /> Review Submissions
        </button>
      </div>

      {/* ── MANAGE TASKS ── */}
      {activeView === "tasks" && (
        <div className="space-y-3">
          <div className={["flex items-center justify-between p-4 rounded-2xl border", headerBg].join(" ")}>
            <div className="flex items-center gap-3">
              <div className={["w-10 h-10 rounded-xl flex items-center justify-center border", iconBg].join(" ")}>
                <PlatformIcon platform={activePlatform} className={["w-5 h-5", iconTxt].join(" ")} />
              </div>
              <div>
                <p className={["font-black text-base", pText].join(" ")}>{pLabel} Tasks</p>
                <p className="text-xs text-muted-foreground">
                  {platformConfigs.length} task{platformConfigs.length !== 1 ? "s" : ""} · actions: {(PLATFORM_ACTIONS[activePlatform] ?? []).map((a) => a.label).join(", ")}
                </p>
              </div>
            </div>
            <button onClick={() => { setEditingConfig(null); setShowTaskForm(true); }} className={["flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all shadow-md", pBtn].join(" ")}>
              <MdAdd className="text-lg" /> Add Task
            </button>
          </div>

          {configsLoading ? (
            <div className="p-10 flex items-center justify-center text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl mr-2" /> Loading…
            </div>
          ) : platformConfigs.length === 0 ? (
            <div className="p-12 text-center bg-card border border-border rounded-2xl">
              <PlatformIcon platform={activePlatform} className={["w-12 h-12 mx-auto mb-3 opacity-30", iconTxt].join(" ")} />
              <p className="font-bold text-muted-foreground">No tasks yet for {pLabel}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Click "Add Task" to create the first one</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {platformConfigs.map((config) => {
                const actionLabel = PLATFORM_ACTIONS[activePlatform]?.find((a) => a.value === config.action_type)?.label ?? config.action_type;
                const badgeCls = PLT_BADGE[activePlatform] ?? "bg-muted text-foreground";
                const pointTxt = PLT_TEXT[activePlatform] ?? "text-foreground";
                return (
                  <div key={config.id} className={config.is_active ? "bg-card border border-border rounded-2xl p-4 space-y-3" : "bg-card border border-border rounded-2xl p-4 space-y-3 opacity-60"}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={["text-[10px] font-black px-2 py-0.5 rounded-md", badgeCls].join(" ")}>{actionLabel}</span>
                          <span className={config.is_active ? "text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "text-[10px] font-black px-2 py-0.5 rounded-md bg-muted text-muted-foreground"}>
                            {config.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="font-black text-sm text-foreground leading-tight">{config.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{config.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={["font-black text-lg", pointTxt].join(" ")}>+{config.points.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">PZA</p>
                      </div>
                    </div>

                    <a href={config.target_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground truncate">
                      <MdLink className="text-sm shrink-0" />
                      <span className="truncate">{config.target_url}</span>
                      <MdOpenInNew className="text-sm shrink-0" />
                    </a>

                    <div className="flex gap-2 pt-1 border-t border-border">
                      <button onClick={() => toggleActive({ id: config.id, is_active: !config.is_active })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-bold text-muted-foreground transition-all">
                        {config.is_active ? <MdVisibilityOff className="text-sm" /> : <MdVisibility className="text-sm" />}
                        {config.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => { setEditingConfig(config); setShowTaskForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-bold text-muted-foreground transition-all">
                        <MdEdit className="text-sm" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(config.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-xs font-bold text-red-600 dark:text-red-400 transition-all ml-auto">
                        <MdDelete className="text-sm" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS ── */}
      {activeView === "submissions" && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
                <input type="text" placeholder="Search username or email…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold">Search</button>
            </form>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
              {platformConfigs.length > 0 && (
                <div className="relative">
                  <select value={taskFilter} onChange={(e) => { setTaskFilter(e.target.value); setPage(1); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                    <option value="">All Tasks</option>
                    {platformConfigs.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            {subsLoading ? (
              <div className="p-12 flex items-center justify-center">
                <MdRefresh className="animate-spin text-2xl text-muted-foreground mr-3" />
                <span className="text-muted-foreground">Loading…</span>
              </div>
            ) : !subsData?.submissions.length ? (
              <div className="p-12 text-center">
                <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No submissions found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["User", "Task", "Screenshot", "Status", "Submitted", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subsData.submissions.map((sub) => {
                        const taskConfig = configMap[sub.task_id];
                        const actionLabel = taskConfig ? (PLATFORM_ACTIONS[taskConfig.platform]?.find((a) => a.value === taskConfig.action_type)?.label ?? taskConfig.action_type) : sub.task_id;
                        const pBadge = taskConfig ? PLT_BADGE[taskConfig.platform] ?? "bg-muted text-foreground" : "bg-muted text-foreground";
                        const subStatusCls: Record<string, string> = {
                          pending:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
                          approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
                          rejected: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300",
                        };
                        const sc = subStatusCls[sub.status] ?? subStatusCls.pending;
                        return (
                          <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-foreground text-sm">{sub.users?.username ?? "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{sub.users?.email ?? "—"}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              {taskConfig && <p className="text-xs font-bold text-foreground line-clamp-1 mb-1">{taskConfig.title}</p>}
                              <span className={["text-[10px] font-black px-2 py-0.5 rounded-md", pBadge].join(" ")}>{actionLabel}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              {sub.screenshot_url ? (
                                <button onClick={() => setSelectedSub(sub)} className="relative group/thumb">
                                  <img src={sub.screenshot_url} alt="screenshot" className="w-14 h-10 object-cover rounded-lg border border-border group-hover/thumb:opacity-70 transition-opacity" />
                                  <MdZoomIn className="absolute inset-0 m-auto text-white text-xl opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow" />
                                </button>
                              ) : <span className="text-muted-foreground text-xs">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={["inline-flex items-center text-[10px] font-black px-2 py-1 rounded-lg", sc].join(" ")}>{sub.status}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(sub.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <button onClick={() => setSelectedSub(sub)} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all">
                                <MdOpenInNew className="text-sm" /> Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {(subsData?.pages ?? 0) > 1 && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Page {subsData?.page} of {subsData?.pages} · {subsData?.total} total</p>
                    <div className="flex gap-2">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted text-foreground disabled:opacity-40">← Prev</button>
                      <button onClick={() => setPage((p) => Math.min(subsData?.pages ?? 1, p + 1))} disabled={page === (subsData?.pages ?? 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted text-foreground disabled:opacity-40">Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showTaskForm && (
        <TaskFormModal platformId={activePlatform} editing={editingConfig} onClose={() => { setShowTaskForm(false); setEditingConfig(null); }} />
      )}

      {selectedSub && (
        <ReviewModal submission={selectedSub} configMap={configMap} onClose={() => setSelectedSub(null)} onDone={() => queryClient.invalidateQueries({ queryKey: ["admin", "social-tasks"] })} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-foreground text-lg mb-2">Delete Task?</h3>
            <p className="text-sm text-muted-foreground mb-5">This will permanently remove the task. Existing submissions remain visible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => doDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Unused import prevention */}
      <span className="hidden"><MdPending /></span>
    </div>
  );
};

export default SocialTasks;
