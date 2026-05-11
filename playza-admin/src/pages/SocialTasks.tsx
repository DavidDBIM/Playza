import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import { AxiosError } from "axios";
import {
  MdSearch, MdRefresh, MdCheckCircle, MdCancel, MdPending,
  MdOpenInNew, MdZoomIn, MdAdd, MdEdit, MdDelete, MdClose,
  MdLink, MdVisibility, MdVisibilityOff,
} from "react-icons/md";
import {
  FaXTwitter, FaYoutube, FaFacebook, FaTiktok, FaInstagram,
} from "react-icons/fa6";
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

// ─── Platform config ───────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "twitter",   label: "X (Twitter)", icon: FaXTwitter,   color: "sky",   hex: "#1DA1F2" },
  { id: "youtube",   label: "YouTube",      icon: FaYoutube,    color: "red",   hex: "#FF0000" },
  { id: "facebook",  label: "Facebook",     icon: FaFacebook,   color: "blue",  hex: "#1877F2" },
  { id: "tiktok",    label: "TikTok",       icon: FaTiktok,     color: "slate", hex: "#000000" },
  { id: "instagram", label: "Instagram",    icon: FaInstagram,  color: "pink",  hex: "#E1306C" },
  { id: "medium",    label: "Medium",       icon: SiMedium,     color: "stone", hex: "#000000" },
] as const;

const PLATFORM_ACTIONS: Record<string, { value: string; label: string }[]> = {
  twitter:   [
    { value: "follow",   label: "Follow" },
    { value: "like",     label: "Like a Post" },
    { value: "retweet",  label: "Retweet" },
    { value: "quote",    label: "Quote Tweet" },
    { value: "comment",  label: "Comment / Reply" },
  ],
  youtube:   [
    { value: "subscribe", label: "Subscribe" },
    { value: "like",      label: "Like a Video" },
    { value: "comment",   label: "Comment on a Video" },
  ],
  facebook:  [
    { value: "like_page", label: "Like Page" },
    { value: "share",     label: "Share a Post" },
    { value: "comment",   label: "Comment on a Post" },
  ],
  tiktok:    [
    { value: "follow",  label: "Follow" },
    { value: "like",    label: "Like a Video" },
    { value: "comment", label: "Comment on a Video" },
  ],
  instagram: [
    { value: "follow",  label: "Follow" },
    { value: "like",    label: "Like a Post" },
    { value: "comment", label: "Comment on a Post" },
  ],
  medium:    [
    { value: "follow", label: "Follow" },
    { value: "clap",   label: "Clap on an Article" },
  ],
};

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string; tab: string; badge: string }> = {
  twitter:   { bg: "bg-sky-50 dark:bg-sky-950/20",    text: "text-sky-600 dark:text-sky-400",    border: "border-sky-200 dark:border-sky-800",    tab: "bg-sky-500",   badge: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300" },
  youtube:   { bg: "bg-red-50 dark:bg-red-950/20",    text: "text-red-600 dark:text-red-400",    border: "border-red-200 dark:border-red-800",    tab: "bg-red-500",   badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
  facebook:  { bg: "bg-blue-50 dark:bg-blue-950/20",  text: "text-blue-600 dark:text-blue-400",  border: "border-blue-200 dark:border-blue-800",  tab: "bg-blue-500",  badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
  tiktok:    { bg: "bg-slate-50 dark:bg-slate-900/40",text: "text-slate-800 dark:text-slate-200",border: "border-slate-200 dark:border-slate-700",tab: "bg-slate-700", badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" },
  instagram: { bg: "bg-pink-50 dark:bg-pink-950/20",  text: "text-pink-600 dark:text-pink-400",  border: "border-pink-200 dark:border-pink-800",  tab: "bg-pink-500",  badge: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300" },
  medium:    { bg: "bg-stone-50 dark:bg-stone-900/40",text: "text-stone-700 dark:text-stone-300",border: "border-stone-200 dark:border-stone-700",tab: "bg-stone-700", badge: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300" },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:  { label: "Pending",  icon: <MdPending />,      cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  approved: { label: "Approved", icon: <MdCheckCircle />,  cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  rejected: { label: "Rejected", icon: <MdCancel />,       cls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300" },
};

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
  const { data } = await apiClient.patch(`/admin/social-tasks/configs/${id}`, payload);
  return data.data;
}

async function deleteConfig(id: string): Promise<void> {
  await apiClient.delete(`/admin/social-tasks/configs/${id}`);
}

async function fetchSubmissions(params: {
  page: number; limit: number; search: string; status: string; platform: string; task_config_id: string;
}): Promise<SubmissionsResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.search         && { search: params.search }),
    ...(params.status         && { status: params.status }),
    ...(params.platform       && { platform: params.platform }),
    ...(params.task_config_id && { task_config_id: params.task_config_id }),
  });
  const { data } = await apiClient.get(`/admin/social-tasks?${query}`);
  return data.data;
}

async function reviewSubmission(payload: { id: string; action: "approve" | "reject"; admin_note?: string }) {
  const { data } = await apiClient.post(`/admin/social-tasks/${payload.id}/review`, {
    action: payload.action,
    admin_note: payload.admin_note,
  });
  return data.data;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PlatformIcon({ platformId, className }: { platformId: string; className?: string }) {
  const p = PLATFORMS.find((p) => p.id === platformId);
  if (!p) return <Share2 className={className ?? "w-4 h-4"} />;
  const Icon = p.icon;
  return <Icon className={className ?? "w-4 h-4"} />;
}

// ─── Create / Edit Task Modal ─────────────────────────────────────────────────

interface TaskFormModalProps {
  platformId: string;
  editing: TaskConfig | null;
  onClose: () => void;
  onSaved: () => void;
}

function TaskFormModal({ platformId, editing, onClose, onSaved }: TaskFormModalProps) {
  const queryClient = useQueryClient();
  const actions = PLATFORM_ACTIONS[platformId] ?? [];
  const colors = PLATFORM_COLORS[platformId];
  const platformLabel = PLATFORMS.find((p) => p.id === platformId)?.label ?? platformId;

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
      onSaved();
    },
    onError: (err: AxiosError<{ message?: string }>) => setError(err.response?.data?.message ?? err.message ?? "Save failed"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim())      return setError("Title is required");
    if (!form.description.trim())return setError("Description is required");
    if (!form.target_url.trim()) return setError("Target URL is required");
    save();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center`}>
              <PlatformIcon platformId={platformId} className={`w-4 h-4 ${colors.text}`} />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base">
                {editing ? "Edit Task" : `New ${platformLabel} Task`}
              </h3>
              <p className="text-xs text-muted-foreground">This will appear on users' Loyalty page</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-all">
            <MdClose className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Action type */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Action Type
            </label>
            <div className="relative">
              <select
                value={form.action_type}
                onChange={(e) => setForm((f) => ({ ...f, action_type: e.target.value }))}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {actions.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Task Title
            </label>
            <input
              type="text"
              placeholder={`e.g. Retweet our launch post`}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Short instruction shown to the user"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Target URL <span className="text-muted-foreground font-normal normal-case">(link user taps to complete the task)</span>
            </label>
            <div className="relative">
              <MdLink className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
              <input
                type="url"
                placeholder="https://x.com/playzadotgames/status/..."
                value={form.target_url}
                onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              PZA Reward
            </label>
            <input
              type="number"
              min={1}
              max={100000}
              value={form.points}
              onChange={(e) => setForm((f) => ({ ...f, points: parseInt(e.target.value) || 200 }))}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-black transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              {isPending ? "Saving…" : editing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

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
    onError: (err: AxiosError<{ message?: string }>) => setReviewError(err.response?.data?.message ?? err.message ?? "Action failed"),
  });

  const sc = STATUS_CONFIG[submission.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            {config && (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${PLATFORM_COLORS[config.platform]?.bg} ${PLATFORM_COLORS[config.platform]?.border} border`}>
                <PlatformIcon platformId={config.platform} className={`w-4 h-4 ${PLATFORM_COLORS[config.platform]?.text}`} />
              </div>
            )}
            <div>
              <h3 className="font-black text-foreground text-base">{submission.users?.username ?? "User"}</h3>
              <p className="text-xs text-muted-foreground">{submission.users?.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-all">
            <MdClose className="text-lg" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${sc.cls}`}>
              {sc.icon} {sc.label}
            </span>
            {config && (
              <>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${PLATFORM_COLORS[config.platform]?.badge}`}>
                  {PLATFORMS.find(p => p.id === config.platform)?.label}
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
                  {PLATFORM_ACTIONS[config.platform]?.find(a => a.value === config.action_type)?.label ?? config.action_type}
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  +{config.points} PZA on approval
                </span>
              </>
            )}
          </div>

          {/* Task info */}
          {config && (
            <div className="bg-muted/50 rounded-xl p-3 space-y-1">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Task</p>
              <p className="text-sm font-bold text-foreground">{config.title}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          )}

          {/* Screenshot */}
          {submission.screenshot_url && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Submitted Screenshot</p>
              <button onClick={() => setLightbox(true)} className="w-full relative group/shot">
                <img
                  src={submission.screenshot_url}
                  alt="screenshot"
                  className="w-full max-h-64 object-contain rounded-xl border border-border bg-muted group-hover/shot:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/shot:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white rounded-lg text-xs font-bold">
                    <MdZoomIn className="text-base" /> View Full Size
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Submitted</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(submission.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            {submission.reviewed_at && (
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Reviewed</p>
                <p className="text-sm font-bold text-foreground">
                  {new Date(submission.reviewed_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            )}
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2">
              Admin Note (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add a note visible to the user if rejected…"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-black text-sm transition-all shadow-md shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                <MdCheckCircle className="text-lg" /> {reviewing ? "…" : `Approve (+${config?.points ?? 200} PZA)`}
              </button>
            </div>
          ) : (
            <div className={`py-3 rounded-xl text-center text-sm font-black ${sc.cls}`}>
              This submission has been <span className="uppercase">{submission.status}</span>
              {submission.reviewed_at && (
                <span className="font-normal text-xs block mt-0.5">
                  on {new Date(submission.reviewed_at).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <MdClose className="text-xl" />
          </button>
          <img src={submission.screenshot_url} alt="full" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const SocialTasks: React.FC = () => {
  const queryClient = useQueryClient();

  // Platform tab state
  const [activePlatform, setActivePlatform] = useState<string>("twitter");
  // Inner view: "tasks" (manage configs) or "submissions" (review screenshots)
  const [activeView, setActiveView] = useState<"tasks" | "submissions">("tasks");

  // Task form modal
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaskConfig | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Submission filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [selectedSub, setSelectedSub] = useState<SocialTaskSubmission | null>(null);

  // Fetch all configs
  const { data: allConfigs = [], isLoading: configsLoading, refetch: refetchConfigs } = useQuery({
    queryKey: ["admin", "social-task-configs"],
    queryFn: fetchConfigs,
  });

  // Configs for current platform
  const platformConfigs = allConfigs.filter((c) => c.platform === activePlatform);
  // Config map for quick lookup in review modal
  const configMap = Object.fromEntries(allConfigs.map((c) => [c.id, c]));

  // Fetch submissions (filtered by platform)
  const { data: subsData, isLoading: subsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ["admin", "social-tasks", { page, search, statusFilter, taskFilter, activePlatform }],
    queryFn: () => fetchSubmissions({
      page, limit: 15, search, status: statusFilter,
      platform: activeView === "submissions" ? activePlatform : "",
      task_config_id: taskFilter,
    }),
    enabled: activeView === "submissions",
  });

  const { mutate: doDelete } = useMutation({
    mutationFn: deleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "social-task-configs"] });
      setDeleteConfirm(null);
    },
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

  const colors = PLATFORM_COLORS[activePlatform];
  const platformInfo = PLATFORMS.find((p) => p.id === activePlatform);

  return (
    <div className="p-4 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-400/30">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Social Tasks</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Create tasks per platform · review screenshot submissions
            </p>
          </div>
        </div>
        <button
          onClick={() => { refetchConfigs(); refetchSubs(); }}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
        >
          <MdRefresh className={`text-lg ${configsLoading || subsLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2 flex-wrap">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          const isActive = activePlatform === p.id;
          const c = PLATFORM_COLORS[p.id];
          const taskCount = allConfigs.filter((cfg) => cfg.platform === p.id && cfg.is_active).length;
          return (
            <button
              key={p.id}
              onClick={() => { setActivePlatform(p.id); setPage(1); setTaskFilter(""); setSearch(""); setSearchInput(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isActive
                  ? `${c.bg} ${c.text} ${c.border} shadow-sm`
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {p.label}
              {taskCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isActive ? `${c.badge}` : "bg-background text-muted-foreground"}`}>
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Inner view tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveView("tasks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === "tasks" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Settings className="w-4 h-4" /> Manage Tasks
        </button>
        <button
          onClick={() => setActiveView("submissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === "submissions" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ListChecks className="w-4 h-4" /> Review Submissions
        </button>
      </div>

      {/* ── MANAGE TASKS VIEW ─────────────────────────────────────────────── */}
      {activeView === "tasks" && (
        <div className="space-y-3">
          {/* Platform header + add button */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border ${colors.bg} ${colors.border}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.border} border`}>
                {platformInfo && <platformInfo.icon className={`w-5 h-5 ${colors.text}`} />}
              </div>
              <div>
                <p className={`font-black text-base ${colors.text}`}>{platformInfo?.label} Tasks</p>
                <p className="text-xs text-muted-foreground">
                  {platformConfigs.length} task{platformConfigs.length !== 1 ? "s" : ""} · actions: {(PLATFORM_ACTIONS[activePlatform] ?? []).map(a => a.label).join(", ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditingConfig(null); setShowTaskForm(true); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all text-white shadow-md ${colors.tab}`}
            >
              <MdAdd className="text-lg" /> Add Task
            </button>
          </div>

          {/* Task cards */}
          {configsLoading ? (
            <div className="p-10 flex items-center justify-center text-muted-foreground">
              <MdRefresh className="animate-spin text-2xl mr-2" /> Loading…
            </div>
          ) : platformConfigs.length === 0 ? (
            <div className="p-12 text-center bg-card border border-border rounded-2xl">
              {platformInfo && <platformInfo.icon className={`w-12 h-12 mx-auto mb-3 ${colors.text} opacity-30`} />}
              <p className="font-bold text-muted-foreground">No tasks yet for {platformInfo?.label}</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Click "Add Task" to create the first one</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {platformConfigs.map((config) => {
                const actionLabel = PLATFORM_ACTIONS[activePlatform]?.find(a => a.value === config.action_type)?.label ?? config.action_type;
                return (
                  <div key={config.id} className={`bg-card border rounded-2xl p-4 space-y-3 transition-all ${config.is_active ? "border-border" : "border-border opacity-60"}`}>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${colors.badge}`}>
                            {actionLabel}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${config.is_active ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                            {config.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="font-black text-sm text-foreground leading-tight">{config.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{config.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black text-lg ${colors.text}`}>+{config.points.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">PZA</p>
                      </div>
                    </div>

                    {/* URL */}
                    <a
                      href={config.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                    >
                      <MdLink className="text-sm shrink-0" />
                      <span className="truncate">{config.target_url}</span>
                      <MdOpenInNew className="text-sm shrink-0" />
                    </a>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 border-t border-border">
                      <button
                        onClick={() => toggleActive({ id: config.id, is_active: !config.is_active })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-bold text-muted-foreground transition-all"
                      >
                        {config.is_active ? <MdVisibilityOff className="text-sm" /> : <MdVisibility className="text-sm" />}
                        {config.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => { setEditingConfig(config); setShowTaskForm(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-bold text-muted-foreground transition-all"
                      >
                        <MdEdit className="text-sm" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(config.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold text-red-600 dark:text-red-400 transition-all ml-auto"
                      >
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

      {/* ── SUBMISSIONS VIEW ──────────────────────────────────────────────── */}
      {activeView === "submissions" && (
        <div className="space-y-3">
          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",    value: subsData?.total ?? 0,                                                          color: "text-foreground" },
              { label: "Pending",  value: subsData?.submissions.filter(s => s.status === "pending").length ?? 0,         color: "text-amber-600 dark:text-amber-400" },
              { label: "Approved", value: subsData?.submissions.filter(s => s.status === "approved").length ?? 0,        color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Rejected", value: subsData?.submissions.filter(s => s.status === "rejected").length ?? 0,        color: "text-red-500 dark:text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-xs text-muted-foreground font-black uppercase tracking-wider">{s.label}</p>
                <p className={`text-3xl font-number mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
              <div className="relative flex-1">
                <MdSearch className="-translate-y-1/2 absolute left-3 top-1/2 text-muted-foreground text-lg" />
                <input
                  type="text"
                  placeholder="Search username or email…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
                Search
              </button>
            </form>

            <div className="flex gap-2 flex-wrap">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>

              {/* Task filter — only tasks for the current platform */}
              {platformConfigs.length > 0 && (
                <div className="relative">
                  <select
                    value={taskFilter}
                    onChange={(e) => { setTaskFilter(e.target.value); setPage(1); }}
                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                  >
                    <option value="">All Tasks</option>
                    {platformConfigs.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
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
                <span className="text-muted-foreground font-medium">Loading submissions…</span>
              </div>
            ) : !subsData?.submissions.length ? (
              <div className="p-12 text-center">
                <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-bold">No submissions found</p>
                <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {["User", "Task", "Screenshot", "Status", "Submitted", "Actions"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subsData.submissions.map((sub) => {
                        const sc = STATUS_CONFIG[sub.status];
                        const taskConfig = configMap[sub.task_id];
                        const actionLabel = taskConfig
                          ? PLATFORM_ACTIONS[taskConfig.platform]?.find(a => a.value === taskConfig.action_type)?.label ?? taskConfig.action_type
                          : sub.task_id;
                        const pColor = taskConfig ? PLATFORM_COLORS[taskConfig.platform] : null;

                        return (
                          <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-foreground text-sm">{sub.users?.username ?? "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{sub.users?.email ?? "—"}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="space-y-1">
                                {taskConfig && (
                                  <p className="text-xs font-bold text-foreground line-clamp-1">{taskConfig.title}</p>
                                )}
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${pColor?.badge ?? "bg-muted text-muted-foreground"}`}>
                                  {actionLabel}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              {sub.screenshot_url ? (
                                <button onClick={() => setSelectedSub(sub)} className="relative group/thumb">
                                  <img src={sub.screenshot_url} alt="screenshot" className="w-14 h-10 object-cover rounded-lg border border-border group-hover/thumb:opacity-70 transition-opacity" />
                                  <MdZoomIn className="absolute inset-0 m-auto text-white text-xl opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${sc.cls}`}>
                                {sc.icon} {sc.label}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(sub.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={() => setSelectedSub(sub)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all"
                              >
                                <MdOpenInNew className="text-sm" /> Review
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {(subsData?.pages ?? 0) > 1 && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                      Page {subsData?.page} of {subsData?.pages} · {subsData?.total} total
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(subsData?.pages ?? 1, p + 1))}
                        disabled={page === (subsData?.pages ?? 1)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {showTaskForm && (
        <TaskFormModal
          platformId={activePlatform}
          editing={editingConfig}
          onClose={() => { setShowTaskForm(false); setEditingConfig(null); }}
          onSaved={() => { setShowTaskForm(false); setEditingConfig(null); }}
        />
      )}

      {selectedSub && (
        <ReviewModal
          submission={selectedSub}
          configMap={configMap}
          onClose={() => setSelectedSub(null)}
          onDone={() => queryClient.invalidateQueries({ queryKey: ["admin", "social-tasks"] })}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-black text-foreground text-lg mb-2">Delete Task?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              This will permanently remove the task. Existing submissions will still be visible but cannot reference this task config.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-all">
                Cancel
              </button>
              <button
                onClick={() => doDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialTasks;
