"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  readAt?: string;
  createdAt: string;
};

const icons: Record<string, string> = {
  rfq: "🏭",
  quotation: "📄",
  response: "✅",
  payment: "💰",
  approval: "🛡️",
  system: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => apiFetch("/notifications")
    .then((data) => {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    })
    .catch((error) => toast.error(error.message))
    .finally(() => setLoading(false));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications");
    }
  };

  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      await apiFetch(`/notifications/${item._id}/read`, { method: "PUT" }).catch(() => undefined);
      window.dispatchEvent(new Event("profile-updated"));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-semibold uppercase tracking-[0.2em] text-yellow-600">Afrilink updates</p><h1 className="mt-2 text-4xl font-bold text-blue-950">Notifications</h1><p className="mt-2 text-slate-600">Your sourcing, quotation, payment and approval activity.</p></div>
          {unreadCount > 0 && <button onClick={markAllRead} className="rounded-xl border border-blue-950 px-4 py-2 font-bold text-blue-950 hover:bg-blue-50">Mark all as read</button>}
        </div>

        {loading ? <div className="mt-8 rounded-2xl bg-white p-8">Loading notifications...</div> : notifications.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center"><div className="text-4xl">🔔</div><h2 className="mt-3 text-2xl font-bold text-blue-950">You are all caught up</h2><p className="mt-2 text-slate-600">New Afrilink activity will appear here.</p></div>
        ) : <div className="mt-8 space-y-3">{notifications.map((item) => (
          <Link key={item._id} href={item.href || "/dashboard"} onClick={() => openNotification(item)} className={`flex gap-4 rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${item.readAt ? "bg-white" : "border-yellow-300 bg-yellow-50"}`}>
            <span className="text-2xl" aria-hidden="true">{icons[item.type] || "🔔"}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold text-blue-950">{item.title}</h2>{!item.readAt && <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">New</span>}</div><p className="mt-1 text-sm text-slate-700">{item.message}</p><p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("en-GB")}</p></div>
          </Link>
        ))}</div>}
      </div>
    </main>
  );
}
