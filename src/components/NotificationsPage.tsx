import React, { useState } from "react";
import {
  Bell,
  Megaphone,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Inbox,
  ShieldCheck,
} from "lucide-react";

interface NotificationItem {
  id: string;
  _mode: string; // 'email' | 'device' | 'global'
  targetEmail?: string;
  targetDeviceId?: string;
  message: string;
  notes?: string;
  url?: string;
  isRead: boolean;
  createdAt?: string;
}

interface NotificationsPageProps {
  user: any;
  notifications: NotificationItem[];
  onAcknowledge: (notif: NotificationItem) => void;
  onAcknowledgeAll: () => void;
}

export default function NotificationsPage({
  user,
  notifications,
  onAcknowledge,
  onAcknowledgeAll,
}: NotificationsPageProps) {
  const [filter, setFilter] = useState<"all" | "direct" | "global">("all");

  // Filter notifications based on user choice
  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "direct")
      return notif._mode === "email" || notif._mode === "device";
    if (filter === "global") return notif._mode === "global";
    return true;
  });

  const directUnreadCount = notifications.filter(
    (n) => n.targetEmail !== "ALL" && !n.isRead,
  ).length;
  const globalCount = notifications.filter((n) => n._mode === "global").length;

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-12">
      {/* Top Header Card */}
      <div className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-none sm:rounded-none sm:rounded-apple-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 z-10 text-center md:text-left">
          <div className="w-20 h-20 bg-slate-50 flex items-center justify-center border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl shrink-0">
            <Bell size={36} className="text-slate-800 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="section-subheading text-emerald-600 font-extrabold uppercase tracking-widest text-[10px]">
              Real-time Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              Notifications Center
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Keep track of direct messages, system status updates, and
              announcement broadcasts.
            </p>
          </div>
        </div>

        {filteredNotifications.length > 0 && (
          <button
            onClick={onAcknowledgeAll}
            className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 text-white font-black uppercase text-[10px] tracking-[0.2em] px-6 py-4.5 rounded transition-colors duration-150 z-10 shrink-0 cursor-pointer border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-900"
          >
            <CheckCircle2 size={14} />
            Acknowledge All
          </button>
        )}
      </div>

      {/* Tabs and Filtering Rails */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150"
            }`}
          >
            All Updates ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("direct")}
            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
              filter === "direct"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150"
            }`}
          >
            Direct ({directUnreadCount})
          </button>
          <button
            onClick={() => setFilter("global")}
            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded transition-all cursor-pointer ${
              filter === "global"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150"
            }`}
          >
            Broadcasts ({globalCount})
          </button>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Showing {filteredNotifications.length} of {notifications.length}{" "}
          message nodes
        </div>
      </div>

      {/* List Container */}
      <div className="space-y-6">
        {filteredNotifications.length === 0 ? (
          <div className="bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-150 rounded-xl p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 flex items-center justify-center rounded-full text-slate-350">
              <Inbox size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider">
                Operational inbox clear
              </h3>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                You have no active notification modules matching the current
                selection.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotifications.map((notif) => {
              const isGlobal = notif._mode === "global";
              const formattedDate = notif.createdAt
                ? new Date(notif.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Delivered";

              return (
                <div
                  key={notif.id}
                  id={`notif-card-${notif.id}`}
                  className="bg-white border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 rounded-none sm:rounded-none sm:rounded-apple-xl p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-slate-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 border-y border-x-0 sm:border sm:border-x rounded-none sm:rounded-apple shrink-0 mt-0.5 ${
                        isGlobal
                          ? "bg-slate-50 border-slate-200 text-slate-700"
                          : "bg-emerald-50 border-emerald-100 text-emerald-750"
                      }`}
                    >
                      {isGlobal ? (
                        <Megaphone size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded border-y border-x-0 sm:border sm:border-x ${
                            isGlobal
                              ? "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {isGlobal ? "Global Announcement" : "Direct Message"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono text-xs">
                          {formattedDate}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight break-words">
                        {notif.message}
                      </h3>

                      {notif.notes && (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-lg border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-100 whitespace-pre-wrap break-words">
                          {notif.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-3 shrink-0">
                    {notif.url && (
                      <a
                        href={notif.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4.5 py-3 bg-slate-50 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer whitespace-nowrap"
                      >
                        <ExternalLink size={12} />
                        Explore Details
                      </a>
                    )}

                    <button
                      onClick={() => onAcknowledge(notif)}
                      className="flex items-center gap-1.5 px-4.5 py-3 bg-slate-900 hover:bg-emerald-600 border-y sm:border-y border-x-0 sm:border sm:border-x sm:border-x border-slate-900 hover:border-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 size={12} />
                      Acknowledge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
