"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BuyerOnly from "./BuyerOnly";
import { apiFetch } from "@/src/lib/api";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<{ name: string; avatar?: string }>({ name: "Account" });
  const [{ isLoggedIn, isAdmin, role }, setAuthState] = useState({ isLoggedIn: false, isAdmin: false, role: "" });

  useEffect(() => {
    function syncAccount() {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      let savedRole = "";
      let savedProfile = { name: "Account", avatar: "" };
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          savedRole = user?.role || "";
          savedProfile = { name: user?.name || "Account", avatar: user?.avatar || "" };
        } catch { /* Ignore invalid browser data. */ }
      }
      setAuthState({ isLoggedIn: !!token, isAdmin: ["admin", "super_admin"].includes(savedRole), role: savedRole });
      setProfile(savedProfile);
      if (!token) return setUnreadCount(0);
      Promise.all([apiFetch("/profile"), apiFetch("/notifications")]).then(([profileData, notificationData]) => {
        const currentUser = profileData.user;
        localStorage.setItem("user", JSON.stringify(currentUser));
        const currentRole = currentUser?.role || "";
        setAuthState({ isLoggedIn: true, isAdmin: ["admin", "super_admin"].includes(currentRole), role: currentRole });
        setProfile({ name: currentUser?.name || "Account", avatar: currentUser?.avatar || "" });
        setUnreadCount(notificationData.unreadCount || 0);
        window.dispatchEvent(new Event("session-refreshed"));
      }).catch(() => setUnreadCount(0));
    }
    syncAccount();
    window.addEventListener("profile-updated", syncAccount);
    return () => window.removeEventListener("profile-updated", syncAccount);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    const query = headerSearch.trim();
    window.location.href = query ? `/products?search=${encodeURIComponent(query)}` : "/products";
  }

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-900 shadow-sm">
      <div className="hidden bg-gradient-to-r from-orange-50 via-orange-100 to-orange-900 text-xs lg:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-center gap-3 px-5 font-semibold"><span className="font-black text-orange-600">Afrilink Smart Sourcing</span><span className="text-slate-600">Find products, request quotations and manage procurement from one account</span><Link href="/products" className="ml-4 bg-slate-950 px-4 py-2 text-white">Explore now →</Link></div>
      </div>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 lg:h-[68px] lg:px-5">
        <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-orange-600 lg:text-2xl">Afrilink<span className="text-blue-950">Capital</span></Link>
        <form onSubmit={search} className="hidden min-w-0 max-w-2xl flex-1 overflow-hidden rounded-full border-2 border-orange-500 bg-white lg:flex">
          <input value={headerSearch} onChange={(event) => setHeaderSearch(event.target.value)} aria-label="Search products" placeholder="What product are you looking for?" className="min-w-0 flex-1 px-5 py-2.5 text-sm outline-none" />
          <button className="m-1 rounded-full bg-orange-500 px-6 text-sm font-black text-white hover:bg-orange-600">⌕ Search</button>
        </form>
        <div className="ml-auto hidden items-center gap-4 text-xs lg:flex">
          <span className="leading-tight"><span className="block text-[10px] text-slate-500">Deliver to</span>🇿🇲 Lusaka, ZM</span><Link href="/contact" className="hover:text-orange-600">Help</Link>
          {isLoggedIn ? <><Link href="/notifications" className="relative text-xl" aria-label={`${unreadCount} unread notifications`}>♧{unreadCount > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</Link>{role === "buyer" && <Link href="/saved-products" className="text-xl" aria-label="Saved products">♡</Link>}<div className="relative"><button onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-950 font-black text-white">{profile.avatar ? <span role="img" aria-label={`${profile.name} profile picture`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatar})` }} /> : profile.name.charAt(0).toUpperCase()}</span><span className="max-w-24 truncate">{profile.name}</span></button>{profileOpen && <div className="absolute right-0 mt-3 w-52 rounded-xl border bg-white p-2 shadow-xl"><Link href="/profile" className="block rounded-lg px-4 py-3 hover:bg-slate-50">My Profile</Link>{role === "buyer" && <Link href="/saved-products" className="block rounded-lg px-4 py-3 hover:bg-slate-50">Saved Products</Link>}<Link href="/dashboard" className="block rounded-lg px-4 py-3 hover:bg-slate-50">Dashboard</Link><button onClick={logout} className="w-full rounded-lg px-4 py-3 text-left text-red-700 hover:bg-red-50">Logout</button></div>}</div></> : <><Link href="/login" className="hover:text-orange-600">♙ Sign in</Link><Link href="/register" className="rounded-full bg-blue-950 px-4 py-2.5 font-bold text-white">Join free</Link></>}
        </div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="ml-auto text-3xl lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>☰</button>
      </div>
      <nav className="hidden border-t border-slate-100 lg:block"><div className="mx-auto flex h-10 max-w-[1440px] items-center gap-6 px-5 text-xs font-semibold"><Link href="/products" className="font-black">☰ All categories</Link><Link href="/products">Verified products</Link><Link href="/post-request">Request for quotation</Link><Link href="/register?type=supplier">Manufacturers</Link><div className="ml-auto flex items-center gap-6"><Link href="/contact">Help Center</Link>{isLoggedIn && <Link href="/dashboard">My Afrilink</Link>}{isAdmin && <Link href="/requests">Manage Requests</Link>}{isAdmin && <Link href="/admin/products">Manage Products</Link>}<Link href="/register?type=supplier">Sell on Afrilink</Link></div></div></nav>
      {menuOpen && <nav className="absolute inset-x-0 top-full flex flex-col gap-1 border-t bg-blue-950 p-4 text-white shadow-xl lg:hidden"><Link href="/" onClick={() => setMenuOpen(false)} className="rounded p-3 hover:bg-blue-900">Home</Link><Link href="/products" className="rounded p-3 hover:bg-blue-900">Products</Link><BuyerOnly><Link href="/post-request" className="block rounded p-3 hover:bg-blue-900">Request Quotation</Link></BuyerOnly><Link href="/contact" className="rounded p-3 hover:bg-blue-900">Contact</Link>{isLoggedIn ? <><Link href="/dashboard" className="rounded p-3 hover:bg-blue-900">Dashboard</Link><Link href="/profile" className="rounded p-3 hover:bg-blue-900">{profile.name}</Link>{role === "buyer" && <Link href="/saved-products" className="rounded p-3 hover:bg-blue-900">Saved Products</Link>}<button onClick={logout} className="rounded p-3 text-left text-red-300 hover:bg-blue-900">Logout</button></> : <><Link href="/login" className="rounded p-3 hover:bg-blue-900">Login</Link><Link href="/register" className="rounded bg-orange-500 p-3 text-center font-bold">Register</Link></>}</nav>}
    </header>
  );
}
