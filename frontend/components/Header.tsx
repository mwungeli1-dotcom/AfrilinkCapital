"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BuyerOnly from "./BuyerOnly";
import { apiFetch } from "@/src/lib/api";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<{ name: string; avatar?: string }>({ name: "Account" });
  const [{ isLoggedIn, isAdmin, role }, setAuthState] = useState({
    isLoggedIn: false,
    isAdmin: false,
    role: "",
  });

  useEffect(() => {
    function syncAccount() {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      let savedUserIsAdmin = false;
      let savedRole = "";
      let savedProfile = { name: "Account", avatar: "" };

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          savedRole = user?.role || "";
          savedUserIsAdmin = ["admin", "super_admin"].includes(savedRole);
          savedProfile = { name: user?.name || "Account", avatar: user?.avatar || "" };
        } catch {
          savedUserIsAdmin = false;
        }
      }

      setAuthState({ isLoggedIn: !!token, isAdmin: savedUserIsAdmin, role: savedRole });
      setProfile(savedProfile);
      if (token) {
        Promise.all([apiFetch("/profile"), apiFetch("/notifications")])
          .then(([profileData, notificationData]) => {
            const currentUser = profileData.user;
            localStorage.setItem("user", JSON.stringify(currentUser));
            const currentRole = currentUser?.role || "";
            setAuthState({ isLoggedIn: true, isAdmin: ["admin", "super_admin"].includes(currentRole), role: currentRole });
            setProfile({ name: currentUser?.name || "Account", avatar: currentUser?.avatar || "" });
            setUnreadCount(notificationData.unreadCount || 0);
            window.dispatchEvent(new Event("session-refreshed"));
          })
          .catch(() => setUnreadCount(0));
      } else {
        setUnreadCount(0);
      }
    }

    // This effect synchronizes navigation with the browser's persisted session.
    syncAccount();
    window.addEventListener("profile-updated", syncAccount);
    return () => window.removeEventListener("profile-updated", syncAccount);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-blue-800 bg-blue-950 px-4 py-4 text-white md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/">
            <h1 className="text-2xl font-bold text-yellow-400 hover:text-white transition">
              Afrilink Capital
            </h1>
          </Link>
        </div>

        <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-3xl"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
      >
        ☰
        </button>

        <div
        id="primary-navigation"
        className={`${
          menuOpen ? "flex" : "hidden"
        } absolute left-0 right-0 top-full flex-col items-stretch gap-1 border-b border-blue-800 bg-blue-950 p-4 md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:p-0`}
      >
        <Link href="/" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2 hover:bg-blue-900 hover:text-yellow-400">
          Home
        </Link>
        <Link href="/products" className="hover:text-yellow-400">
          Products
        </Link>

        <BuyerOnly><Link href="/post-request" className="hover:text-yellow-400">Request Quotation</Link></BuyerOnly>

        <Link href="/contact" className="hover:text-yellow-400">
          Contact
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="hover:text-yellow-400">
              Dashboard
            </Link>
            {role === "buyer" && (
              <Link href="/become-supplier" className="hover:text-yellow-400">
                Become a Supplier
              </Link>
            )}
            {isAdmin && (
              <>
                <Link href="/admin/products" className="hover:text-yellow-400">
                  Manage Products
                </Link>

                <Link href="/requests" className="hover:text-yellow-400">
                  Manage Requests
                </Link>
              </>
            )}

            <Link href="/notifications" onClick={() => setMenuOpen(false)} className="relative flex items-center rounded-full border border-blue-700 bg-blue-900 px-3 py-2 hover:border-yellow-400" aria-label={`${unreadCount} unread notifications`}>
              <span aria-hidden="true">🔔</span>
              {unreadCount > 0 && <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1.5 text-center text-xs font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </Link>

            <div className="relative">
              <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-full border border-blue-700 bg-blue-900 py-1 pl-1 pr-3 hover:border-yellow-400" aria-expanded={profileOpen}>
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-yellow-400 font-bold text-blue-950">
                  {profile.avatar ? <span role="img" aria-label={`${profile.name} profile picture`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatar})` }} /> : profile.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 truncate text-sm font-semibold">{profile.name}</span>
              </button>
              {profileOpen && (
                <div className="right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white p-2 text-gray-800 shadow-xl md:absolute">
                  <Link href="/profile" onClick={() => { setProfileOpen(false); setMenuOpen(false); }} className="block rounded-lg px-4 py-3 hover:bg-gray-100">My Profile</Link>
                  {role === "buyer" && <Link href="/saved-products" onClick={() => { setProfileOpen(false); setMenuOpen(false); }} className="block rounded-lg px-4 py-3 hover:bg-gray-100">Saved Products</Link>}
                  <Link href="/dashboard" onClick={() => { setProfileOpen(false); setMenuOpen(false); }} className="block rounded-lg px-4 py-3 hover:bg-gray-100">Dashboard</Link>
                  <button onClick={logout} className="w-full rounded-lg px-4 py-3 text-left text-red-700 hover:bg-red-50">Logout</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-yellow-400">
              Login
            </Link>

            <Link href="/register" className="hover:text-yellow-400">
              Register
            </Link>
            <Link href="/register?type=supplier" className="rounded-lg bg-yellow-400 px-3 py-2 font-semibold text-blue-950 hover:bg-yellow-300">
              Supplier Registration
            </Link>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
