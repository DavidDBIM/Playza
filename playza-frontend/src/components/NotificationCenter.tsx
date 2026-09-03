import { useMemo, useState } from "react";
import { Bell, Megaphone, Settings, Wallet, ShieldAlert, BellRing, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth";
import { useNotificationsFeed } from "@/hooks/notifications/useNotifications";
import type { NotificationItem } from "@/api/notifications.api";
import { resolveNotificationLink, parseNotificationLink } from "@/utils/notifications";

const READ_IDS_KEY = "playza_notifications_read_ids";
const MAX_STORED_READ_IDS = 200;

const getReadIds = (): string[] => {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const TYPE_STYLES: Record<string, { icon: typeof Bell; className: string }> = {
  "System Update": { icon: Settings, className: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  "Promotional Offer": { icon: Megaphone, className: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
  "Transactional": { icon: Wallet, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  "Maintenance Alert": { icon: ShieldAlert, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  "Login Banner": { icon: BellRing, className: "bg-primary/10 text-primary" },
  "Universal Announcement": { icon: Megaphone, className: "bg-primary/10 text-primary" },
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotificationsFeed(!!user);
  const [readIds, setReadIds] = useState<string[]>(getReadIds);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.includes(n.id)).length,
    [notifications, readIds],
  );

  const persistReadIds = (ids: string[]) => {
    const trimmed = ids.slice(-MAX_STORED_READ_IDS);
    setReadIds(trimmed);
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(trimmed));
  };

  const markRead = (id: string) => {
    if (readIds.includes(id)) return;
    persistReadIds([...readIds, id]);
  };

  const markAllRead = () => {
    persistReadIds([...new Set([...readIds, ...notifications.map((n) => n.id)])]);
  };

  const handleSelect = (notification: NotificationItem) => {
    markRead(notification.id);
    const target = resolveNotificationLink(notification);
    if (!target) return;
    setOpen(false);
    if (target.startsWith("/")) {
      navigate(target);
    } else {
      window.open(target, "_blank");
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-1.5 md:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center outline-none"
          aria-label="Notifications"
        >
          <Bell className={`w-4 h-4 md:w-5 md:h-5 ${unreadCount > 0 ? "text-primary" : "text-slate-500"}`} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 flex h-3.5 w-3.5 md:h-4 md:w-4">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 md:h-4 md:w-4 items-center justify-center text-[8px] md:text-[10px] font-black text-white bg-primary">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 max-h-[70vh] backdrop-blur-2xl bg-white/95 dark:bg-slate-950/95 border border-primary/20 p-0 mt-3 z-80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto scrollbar-hide">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center gap-2 px-6">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <Inbox size={22} />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {notifications.map((notification) => {
                const isRead = readIds.includes(notification.id);
                const tone = TYPE_STYLES[notification.type] || TYPE_STYLES["System Update"];
                const Icon = tone.icon;
                const { text } = parseNotificationLink(notification.content);
                const hasLink = !!resolveNotificationLink(notification);

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleSelect(notification)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      hasLink ? "cursor-pointer" : "cursor-default"
                    } ${!isRead ? "bg-primary/5" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tone.className}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {notification.title || notification.type}
                        </p>
                      </div>
                      {text && (
                        <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {text}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;