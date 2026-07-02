"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setIsAdmin(user?.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <nav className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-blue-800 bg-blue-950 text-white">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-white hover:text-yellow-400 font-semibold">
          HOME
        </Link>

        <Link href="/">
          <h1 className="text-2xl font-bold text-yellow-400 hover:text-white transition">
            Afrilink Capital
          </h1>
        </Link>
      </div>

      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-3xl">
        ☰
      </button>

      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex flex-col md:flex-row gap-6 items-center`}
      >
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
    </nav>
  );
}