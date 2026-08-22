"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";

type SessionState = { role: string; loggedIn: boolean; unreadCount: number };

export default function MobileNav() {
  const pathname = usePathname();
  const [session, setSession] = useState<SessionState>({ role: "", loggedIn: false, unreadCount: 0 });

  useEffect(() => {
    function syncSession() {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      let role = "";
      if (savedUser) {
        try { role = JSON.parse(savedUser)?.role || ""; } catch { role = ""; }
      }
      setSession((current) => ({ ...current, role, loggedIn: !!token }));
      if (token) {
        apiFetch("/notifications")
          .then((data) => setSession((current) => ({ ...current, unreadCount: data.unreadCount || 0 })))
          .catch(() => undefined);
      }
    }
    syncSession();
    window.addEventListener("session-refreshed", syncSession);
    window.addEventListener("profile-updated", syncSession);
    return () => {
      window.removeEventListener("session-refreshed", syncSession);
      window.removeEventListener("profile-updated", syncSession);
    };
  }, []);

  const sourcingHref = session.role === "supplier" ? "/supplier/price-requests" : ["admin", "super_admin"].includes(session.role) ? "/requests" : session.loggedIn ? "/my-requests" : "/post-request";
  const sourcingLabel = session.role === "supplier" ? "RFQs" : session.loggedIn ? "Requests" : "Request";
  const accountHref = session.loggedIn ? "/dashboard" : "/login";
  const items = [
    { href: "/", label: "Home", icon: "⌂", active: pathname === "/" },
    { href: "/products", label: "Categories", icon: "▦", active: pathname.startsWith("/products") },
    { href: sourcingHref, label: sourcingLabel, icon: "◎", active: pathname === sourcingHref || pathname.startsWith("/supplier/price-requests") || pathname.startsWith("/my-requests") || pathname.startsWith("/requests") },
    { href: session.loggedIn ? "/notifications" : "/login", label: "Updates", icon: "▣", active: pathname === "/notifications", badge: session.unreadCount },
    { href: accountHref, label: "Account", icon: "♙", active: pathname === "/dashboard" || pathname === "/profile" || pathname === "/login" },
  ];

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => <Link key={`${item.label}-${item.href}`} href={item.href} aria-current={item.active ? "page" : undefined} className={`relative flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-bold transition ${item.active ? "text-yellow-600" : "text-slate-600"}`}><span className={`text-2xl leading-none ${item.active ? "scale-110" : ""}`} aria-hidden="true">{item.icon}</span><span>{item.label}</span>{Boolean(item.badge) && <span className="absolute right-[18%] top-0 min-w-4 rounded-full bg-red-600 px-1 text-center text-[9px] text-white">{item.badge && item.badge > 99 ? "99+" : item.badge}</span>}</Link>)}
      </div>
    </nav>
  );
}
