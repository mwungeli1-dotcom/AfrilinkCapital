"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [{ isLoggedIn, isAdmin }, setAuthState] = useState({
    isLoggedIn: false,
    isAdmin: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    let savedUserIsAdmin = false;

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        savedUserIsAdmin = user?.role === "admin";
      } catch {
        savedUserIsAdmin = false;
      }
    }

    // This effect synchronizes navigation with the browser's persisted session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthState({ isLoggedIn: !!token, isAdmin: savedUserIsAdmin });
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

        <Link href="/post-request" className="hover:text-yellow-400">
          Request Quotation
        </Link>

        <Link href="/contact" className="hover:text-yellow-400">
          Contact
        </Link>

        {isLoggedIn ? (
          <>
            {isAdmin && (
              <>
                <Link href="/dashboard" className="hover:text-yellow-400">
                  Admin Dashboard
                </Link>

                <Link href="/admin/products" className="hover:text-yellow-400">
                  Manage Products
                </Link>

                <Link href="/requests" className="hover:text-yellow-400">
                  Manage Requests
                </Link>
              </>
            )}

            <button onClick={logout} className="hover:text-yellow-400">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-yellow-400">
              Login
            </Link>

            <Link href="/register" className="hover:text-yellow-400">
              Register
            </Link>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}
