import React, { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MdCheckCircle,
  MdHourglassBottom,
  MdCameraAlt,
  MdUpload,
  MdOpenInNew,
  MdClose,
  MdCancel,
  MdRefresh,
} from "react-icons/md";
import { FaXTwitter, FaYoutube, FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa6";
import { SiMedium } from "react-icons/si";
import { Share2 } from "lucide-react";
import { useToast } from "@/context/toast";
import axiosInstance from "@/api/axiosInstance";
import {
  getSocialTaskConfigsApi,
  getMySocialSubmissionsApi,
  type SocialTaskConfig,
} from "@/api/loyalty.api";

// ─── Platform styles — plain string constants, never dynamic ─────────────────

const PLT_LABEL: Record<string, string> = {
  twitter:   "X (Twitter)",
  youtube:   "YouTube",
  facebook:  "Facebook",
  tiktok:    "TikTok",
  instagram: "Instagram",
  medium:    "Medium",
};

const PLT_TAB_ACTIVE: Record<string, string> = {
  twitter:   "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 shadow-sm",
  youtube:   "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 shadow-sm",
  facebook:  "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm",
  tiktok:    "bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-sm",
  instagram: "bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800 shadow-sm",
  medium:    "bg-stone-50 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 shadow-sm",
};

const PLT_BADGE: Record<string, string> = {
  twitter:   "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
  youtube:   "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  facebook:  "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  tiktok:    "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  instagram: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  medium:    "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300",
};

const PLT_ICON_BG: Record<string, string> = {
  twitter:   "bg-sky-50 dark:bg-sky-950/20",
  youtube:   "bg-red-50 dark:bg-red-950/20",
  facebook:  "bg-blue-50 dark:bg-blue-950/20",
  tiktok:    "bg-slate-50 dark:bg-slate-900/40",
  instagram: "bg-pink-50 dark:bg-pink-950/20",
  medium:    "bg-stone-50 dark:bg-stone-900/40",
};

const PLT_TEXT: Record<string, string> = {
  twitter:   "text-sky-600 dark:text-sky-400",
  youtube:   "text-red-600 dark:text-red-400",
  facebook:  "text-blue-600 dark:text-blue-400",
  tiktok:    "text-slate-800 dark:text-slate-200",
  instagram: "text-pink-600 dark:text-pink-400",
  medium:    "text-stone-700 dark:text-stone-300",
};

const PLT_BTN: Record<string, string> = {
  twitter:   "bg-sky-500 hover:bg-sky-600 text-white",
  youtube:   "bg-red-500 hover:bg-red-600 text-white",
  facebook:  "bg-blue-500 hover:bg-blue-600 text-white",
  tiktok:    "bg-slate-700 hover:bg-slate-800 text-white",
  instagram: "bg-pink-500 hover:bg-pink-600 text-white",
  medium:    "bg-stone-700 hover:bg-stone-800 text-white",
};

const ACTION_LABEL: Record<string, string> = {
  follow:    "Follow",
  like:      "Like",
  retweet:   "Retweet",
  quote:     "Quote Tweet",
  comment:   "Comment",
  subscribe: "Subscribe",
  clap:      "Clap",
  share:     "Share",
  like_page: "Like Page",
};

const PLATFORM_ORDER = ["twitter", "youtube", "facebook", "tiktok", "instagram", "medium"];

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

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  claimedTaskIds: Set<string>;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function SocialTasksSection({ claimedTaskIds }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["social-task-configs"],
    queryFn: getSocialTaskConfigsApi,
    staleTime: 60_000,
  });

  const { data: mySubmissions = [], refetch: refetchSubs } = useQuery({
    queryKey: ["social-task-my-submissions"],
    queryFn: getMySocialSubmissionsApi,
    staleTime: 30_000,
  });

  const submissionMap: Record<string, { status: string }> = {};
  for (const s of mySubmissions) {
    submissionMap[s.task_id] = { status: s.status };
  }

  const platformsWithTasks = PLATFORM_ORDER.filter((p) =>
    configs.some((c) => c.platform === p)
  );

  const [activePlatform, setActivePlatform] = useState<string>("");
  const resolved = platformsWithTasks.includes(activePlatform)
    ? activePlatform
    : platformsWithTasks[0] ?? "";

  const platformTasks = configs.filter((c) => c.platform === resolved);

  const [modal, setModal] = useState<SocialTaskConfig | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function openModal(task: SocialTaskConfig) {
    setModal(task);
    setFile(null);
    setPreview(null);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function submit() {
    if (!modal || !file) return;
    setSubmitting(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = () => rej(new Error("Read failed"));
        r.readAsDataURL(file);
      });
      await axiosInstance.post("/pza/social-task/submit", {
        task_id: modal.id,
        screenshot_base64: b64,
        screenshot_mime: file.type,
      });
      await refetchSubs();
      queryClient.invalidateQueries({ queryKey: ["social-task-my-submissions"] });
      toast.success("Screenshot submitted! You will receive " + modal.points + " PZA once approved.");
      setModal(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center text-slate-400">
        <MdRefresh className="animate-spin text-2xl mr-2" />
        <span className="text-sm">Loading social tasks…</span>
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400">
        <Share2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-bold text-sm">No social tasks yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Platform tabs */}
      <div className="flex gap-2 flex-wrap px-4 pt-4 pb-2">
        {platformsWithTasks.map((pid) => {
          const isActive = resolved === pid;
          const count = configs.filter((c) => c.platform === pid).length;
          const tabCls = isActive
            ? ["flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border", PLT_TAB_ACTIVE[pid] ?? ""].join(" ")
            : "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700";
          const badgeCls = isActive
            ? ["text-[9px] font-black px-1.5 py-0.5 rounded-md", PLT_BADGE[pid] ?? ""].join(" ")
            : "text-[9px] font-black px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500";
          return (
            <button key={pid} onClick={() => setActivePlatform(pid)} className={tabCls}>
              <PlatformIcon platform={pid} className="w-3.5 h-3.5" />
              {PLT_LABEL[pid] ?? pid}
              <span className={badgeCls}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {platformTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No tasks for this platform yet.</div>
        ) : (
          platformTasks.map((task) => {
            const sub = submissionMap[task.id];
            const isApproved = claimedTaskIds.has(task.id) || sub?.status === "approved";
            const isPending  = sub?.status === "pending";
            const actionLbl  = ACTION_LABEL[task.action_type] ?? task.action_type;
            const iconBg     = PLT_ICON_BG[task.platform] ?? "bg-slate-100";
            const iconText   = PLT_TEXT[task.platform] ?? "text-slate-600";
            const badgeCls   = PLT_BADGE[task.platform] ?? "bg-slate-100 text-slate-600";
            const pointText  = PLT_TEXT[task.platform] ?? "text-slate-600";

            const rowCls = isApproved
              ? "flex items-center gap-4 px-5 py-4 transition-all opacity-60"
              : "flex items-center gap-4 px-5 py-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50";

            const iconWrapCls = isApproved
              ? "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : ["w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg", iconBg].join(" ");

            const titleCls = isApproved
              ? "font-bold text-sm text-slate-400 dark:text-slate-600 line-through"
              : "font-bold text-sm text-slate-900 dark:text-white";

            return (
              <div key={task.id} className={rowCls}>
                <div className={iconWrapCls}>
                  {isApproved
                    ? <MdCheckCircle />
                    : <PlatformIcon platform={task.platform} className={["w-5 h-5", iconText].join(" ")} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={titleCls}>{task.title}</span>
                    <span className={["text-[9px] font-black px-1.5 py-0.5 rounded-md", badgeCls].join(" ")}>
                      {actionLbl}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={["font-black text-sm", pointText].join(" ")}>+{task.points.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">PZA</p>
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
                      className={["px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1", badgeCls, "hover:opacity-80"].join(" ")}
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

      {/* Submission Modal */}
      {modal !== null && (() => {
        const actionLbl = ACTION_LABEL[modal.action_type] ?? modal.action_type;
        const pLabel    = PLT_LABEL[modal.platform] ?? modal.platform;
        const btnCls    = PLT_BTN[modal.platform] ?? "bg-rose-500 hover:bg-rose-600 text-white";
        const iconBg    = PLT_ICON_BG[modal.platform] ?? "bg-slate-100";
        const iconText  = PLT_TEXT[modal.platform] ?? "text-slate-600";
        const badgeCls  = PLT_BADGE[modal.platform] ?? "bg-slate-100 text-slate-600";

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={["w-9 h-9 rounded-xl flex items-center justify-center", iconBg].join(" ")}>
                    <PlatformIcon platform={modal.platform} className={["w-4 h-4", iconText].join(" ")} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{modal.title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={["text-[9px] font-black px-1.5 py-0.5 rounded-md", badgeCls].join(" ")}>{pLabel}</span>
                      <span className={["text-[9px] font-black px-1.5 py-0.5 rounded-md", badgeCls].join(" ")}>{actionLbl}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">+{modal.points} PZA on approval</span>
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

              <div className="space-y-3 mb-5">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{actionLbl} on {pLabel}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{modal.description}</p>
                    <a
                      href={modal.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={["inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", btnCls].join(" ")}
                    >
                      <MdOpenInNew className="text-sm" /> Open Link
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Take a Screenshot</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Must clearly show your username and the completed action.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Upload Screenshot</p>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                        <button
                          onClick={() => { setFile(null); setPreview(null); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <MdCancel className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-rose-400 rounded-xl py-4 flex flex-col items-center gap-2 transition-colors group"
                      >
                        <MdCameraAlt className="text-2xl text-slate-400 group-hover:text-rose-500 transition-colors" />
                        <span className="text-xs font-bold text-slate-500 group-hover:text-rose-500 transition-colors">Tap to upload screenshot</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2.5 mb-5">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <span className="font-bold">Review process:</span> Admin will verify within 24-48 hours. Once approved, {modal.points} PZA will be credited.
                </p>
              </div>

              <button
                onClick={submit}
                disabled={!file || submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><MdHourglassBottom className="animate-spin" /> Submitting…</>
                ) : (
                  <><MdUpload className="text-base" /> Submit for Review</>
                )}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
