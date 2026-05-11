/**
 * SocialTasksSection.tsx
 *
 * Drop-in replacement for the hardcoded "community" / "Social Tasks" section
 * in Loyalty.tsx. Tasks are fetched dynamically from the backend (created by admin).
 *
 * Usage in Loyalty.tsx — replace the "community" TaskCategory rendering with:
 *
 *   import { SocialTasksSection } from "@/components/loyalty/SocialTasksSection";
 *   ...
 *   {activeCategory === "community" && (
 *     <SocialTasksSection claimedTaskIds={claimedTaskIds} />
 *   )}
 *
 * Also update the TASK_CATEGORIES entry for "community" to have tasks: []
 * so the existing category tab still shows, but task rendering is delegated here.
 */

import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdCheckCircle, MdHourglassBottom, MdCameraAlt, MdUpload,
  MdOpenInNew, MdClose, MdCancel, MdRefresh,
} from "react-icons/md";
import {
  FaXTwitter, FaYoutube, FaFacebook, FaTiktok, FaInstagram,
} from "react-icons/fa6";
import { SiMedium } from "react-icons/si";
import { Share2 } from "lucide-react";
import { useToast } from "@/context/toast";
import axiosInstance from "@/api/axiosInstance";
import {
  getSocialTaskConfigsApi,
  getMySocialSubmissionsApi,
  type SocialTaskConfig,
} from "@/api/loyalty.api";

// ─── Platform display config ──────────────────────────────────────────────────

interface PlatformDisplay {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  tabActive: string;
}

const PLATFORM_INFO: Record<string, PlatformDisplay> = {
  twitter: {
    label: "X (Twitter)",
    icon: FaXTwitter,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/20",
    border: "border-sky-200 dark:border-sky-800",
    badge: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
    tabActive: "bg-sky-500 text-white",
  },
  youtube: {
    label: "YouTube",
    icon: FaYoutube,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    tabActive: "bg-red-500 text-white",
  },
  facebook: {
    label: "Facebook",
    icon: FaFacebook,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    tabActive: "bg-blue-500 text-white",
  },
  tiktok: {
    label: "TikTok",
    icon: FaTiktok,
    color: "text-slate-800 dark:text-slate-200",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-slate-200 dark:border-slate-700",
    badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    tabActive: "bg-slate-800 text-white",
  },
  instagram: {
    label: "Instagram",
    icon: FaInstagram,
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800",
    badge: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
    tabActive: "bg-pink-500 text-white",
  },
  medium: {
    label: "Medium",
    icon: SiMedium,
    color: "text-stone-700 dark:text-stone-300",
    bg: "bg-stone-50 dark:bg-stone-900/40",
    border: "border-stone-200 dark:border-stone-700",
    badge: "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
    tabActive: "bg-stone-700 text-white",
  },
};

// Human-readable action labels
const ACTION_LABELS: Record<string, string> = {
  follow: "Follow",
  like: "Like",
  retweet: "Retweet",
  quote: "Quote Tweet",
  comment: "Comment",
  subscribe: "Subscribe",
  clap: "Clap",
  share: "Share",
  like_page: "Like Page",
};

// Platform order for tabs
const PLATFORM_ORDER = [
  "twitter",
  "youtube",
  "facebook",
  "tiktok",
  "instagram",
  "medium",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  claimedTaskIds: Set<string>; // from loyaltyData.claimed_tasks
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SocialTasksSection({ claimedTaskIds }: Props) {
  const toast = useToast();

  const { data: configs = [], isLoading: configsLoading } = useQuery({
    queryKey: ["social-task-configs"],
    queryFn: getSocialTaskConfigsApi,
    staleTime: 60_000,
  });

  const { data: mySubmissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ["social-task-my-submissions"],
    queryFn: getMySocialSubmissionsApi,
    staleTime: 30_000,
  });

  // Build a quick lookup: task_id → submission
  const submissionMap = Object.fromEntries(
    mySubmissions.map((s) => [s.task_id, s]),
  );

  // Group configs by platform, preserve order
  const platformsWithTasks = PLATFORM_ORDER.filter((p) =>
    configs.some((c) => c.platform === p),
  );

  const [activePlatform, setActivePlatform] = useState<string>(
    () => platformsWithTasks[0] ?? "twitter",
  );

  // Ensure activePlatform is valid after data loads
  const resolvedPlatform = platformsWithTasks.includes(activePlatform)
    ? activePlatform
    : (platformsWithTasks[0] ?? activePlatform);

  const platformTasks = configs.filter((c) => c.platform === resolvedPlatform);

  // Social modal state
  const [modal, setModal] = useState<SocialTaskConfig | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openModal(task: SocialTaskConfig) {
    setModal(task);
    setScreenshotFile(null);
    setScreenshotPreview(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submitTask() {
    if (!modal || !screenshotFile) return;
    setSubmitting(true);
    try {
      const screenshot_base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(screenshotFile);
      });

      await axiosInstance.post("/pza/social-task/submit", {
        task_id: modal.id,
        screenshot_base64,
        screenshot_mime: screenshotFile.type,
      });

      await refetchSubmissions();
      toast.success(
        `Screenshot submitted! You'll receive ${modal.points} PZA once approved.`,
      );
      setModal(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (configsLoading) {
    return (
      <div className="p-10 flex items-center justify-center text-slate-400">
        <MdRefresh className="animate-spin text-2xl mr-2" />
        <span className="text-sm font-medium">Loading social tasks…</span>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400">
        <Share2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-bold text-sm">No social tasks yet</p>
        <p className="text-xs mt-1 opacity-60">Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap px-4 pt-4 pb-2">
        {platformsWithTasks.map((platformId) => {
          const info = PLATFORM_INFO[platformId] as PlatformDisplay;
          if (!info) return null;
          const Icon = info.icon;
          const isActive = resolvedPlatform === platformId;
          const taskCount = configs.filter(
            (c) => c.platform === platformId,
          ).length;
          return (
            <button
              key={platformId}
              onClick={() => setActivePlatform(platformId)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isActive
                  ? `${info.bg} ${info.color} ${info.border} shadow-sm`
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {info.label}
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${isActive ? info.badge : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}
              >
                {taskCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task list for active platform */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {platformTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm font-medium">
              No tasks for this platform yet
            </p>
          </div>
        ) : (
          platformTasks.map((task) => {
            const info = PLATFORM_INFO[task.platform];
            const Icon = info?.icon ?? Share2;
            const submission = submissionMap[task.id];
            const isApproved =
              claimedTaskIds.has(task.id) || submission?.status === "approved";
            const isPending = submission?.status === "pending";
            const actionLabel =
              ACTION_LABELS[task.action_type] ?? task.action_type;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-5 py-4 transition-all ${isApproved ? "opacity-60" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${isApproved ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : `${info?.bg ?? ""}`}`}
                >
                  {isApproved ? (
                    <MdCheckCircle />
                  ) : (
                    <Icon className={`w-5 h-5 ${info?.color ?? ""}`} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span
                      className={`font-bold text-sm ${isApproved ? "text-slate-400 dark:text-slate-600 line-through" : "text-slate-900 dark:text-white"}`}
                    >
                      {task.title}
                    </span>
                    {/* Action type badge */}
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${info?.badge ?? "bg-muted text-muted-foreground"}`}
                    >
                      {actionLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {task.description}
                  </p>
                </div>

                {/* Points + CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`font-black text-sm ${info?.color ?? "text-foreground"}`}
                    >
                      +{task.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      PZA
                    </p>
                  </div>

                  {isApproved ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold">
                      <MdCheckCircle className="text-sm" /> Done
                    </div>
                  ) : isPending ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
                      <MdHourglassBottom className="text-sm" /> Pending
                    </div>
                  ) : (
                    <button
                      onClick={() => openModal(task)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${info?.badge ?? ""} hover:opacity-80`}
                    >
                      <MdUpload className="text-sm" /> Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Submission Modal ─────────────────────────────────────────────── */}
      {modal &&
        (() => {
          const info = PLATFORM_INFO[modal.platform];
          const Icon = info?.icon ?? Share2;
          const actionLabel =
            ACTION_LABELS[modal.action_type] ?? modal.action_type;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl"
              onClick={() => setModal(null)}
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${info?.bg ?? ""} border ${info?.border ?? ""}`}
                    >
                      <Icon className={`w-4 h-4 ${info?.color ?? ""}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {modal.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${info?.badge ?? ""}`}
                        >
                          {info?.label}
                        </span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${info?.badge ?? ""}`}
                        >
                          {actionLabel}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          +{modal.points} PZA after approval
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setModal(null)}
                    className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <MdClose />
                  </button>
                </div>

                {/* Steps */}
                <div className="space-y-3 mb-5">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {actionLabel} on {info?.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {modal.description}
                      </p>
                      <a
                        href={modal.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors text-white ${info?.tabActive ?? "bg-rose-500 hover:bg-rose-600"}`}
                      >
                        <MdOpenInNew className="text-sm" /> Open Link
                      </a>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Take a Screenshot
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Screenshot must clearly show your username and the
                        completed action.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                        Upload Screenshot
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {screenshotPreview ? (
                        <div className="relative">
                          <img
                            src={screenshotPreview}
                            alt="preview"
                            className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                          />
                          <button
                            onClick={() => {
                              setScreenshotFile(null);
                              setScreenshotPreview(null);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <MdCancel className="text-xs" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500 rounded-xl py-4 flex flex-col items-center gap-2 transition-colors group"
                        >
                          <MdCameraAlt className="text-2xl text-slate-400 group-hover:text-rose-500 transition-colors" />
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors">
                            Tap to upload screenshot
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review note */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-5">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                    <span className="font-bold">⚡ Review process:</span> Admin
                    will verify your screenshot within 24–48 hours. Once
                    approved, {modal.points} PZA will be credited.
                  </p>
                </div>

                <button
                  onClick={submitTask}
                  disabled={!screenshotFile || submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-rose-500/30 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <MdHourglassBottom className="animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <MdUpload className="text-base" /> Submit for Review
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
