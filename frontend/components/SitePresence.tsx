"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/src/lib/api";

function getVisitorId() {
  const saved = localStorage.getItem("afrilinkVisitorId");
  if (saved) return saved;
  const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem("afrilinkVisitorId", id);
  return id;
}

export default function SitePresence() {
  const pathname = usePathname();
  useEffect(() => {
    const sendHeartbeat = () => {
      if (document.visibilityState === "hidden") return;
      apiFetch("/analytics/heartbeat", { method: "POST", body: JSON.stringify({ visitorId: getVisitorId(), page: pathname }) }).catch(() => undefined);
    };
    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 30000);
    window.addEventListener("focus", sendHeartbeat);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", sendHeartbeat); };
  }, [pathname]);
  return null;
}
