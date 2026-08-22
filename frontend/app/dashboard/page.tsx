"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiFetch } from "@/src/lib/api";

type DashboardUser = {
  name?: string;
  email?: string;
  role?: "buyer" | "supplier" | "admin" | "super_admin";
};

type AdminOverview = {
  requestCount: number;
  activeOrders: number;
  pendingSuppliers: number;
  pendingProducts: number;
  financials: Array<{ currency: string; quotations: number; quoted: number; collected: number; balance: number; grossProfit: number }>;
  catalogueCommissions: Array<{ currency: string; commission: number }>;
};

type OnlinePresence = { total: number; signedIn: number; guests: number; buyers: number; suppliers: number; pages: Array<{ page: string; count: number }>; updatedAt: string };

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [presence, setPresence] = useState<OnlinePresence | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      toast.error("Please login first");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    // This effect synchronizes the dashboard with the persisted browser session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(savedToken);

    apiFetch("/profile")
      .then(async (data) => {
        const currentUser = data.user as DashboardUser;
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
        window.dispatchEvent(new Event("session-refreshed"));
        if (["admin", "super_admin"].includes(currentUser.role || "")) {
          const overviewData = await apiFetch("/admin/overview");
          setOverview(overviewData.overview);
        }
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Session verification failed");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => { window.location.href = "/login"; }, 1000);
      });
  }, []);

  useEffect(() => {
    if (!user || !["admin", "super_admin"].includes(user.role || "")) return;
    const loadPresence = () => apiFetch("/admin/online-visitors").then((data) => setPresence(data.presence)).catch(() => undefined);
    loadPresence();
    const interval = window.setInterval(loadPresence, 15000);
    return () => window.clearInterval(interval);
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-3 py-5 lg:px-5 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-slate-500">Home › My Afrilink</p><h1 className="mt-1 text-3xl font-black text-slate-950">My Afrilink</h1><p className="mt-1 text-sm text-slate-500">Manage your marketplace activity from one account.</p></div><button onClick={handleLogout} className="rounded-full border border-red-200 bg-white px-5 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Logout</button></div>
        <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
          <aside className="h-fit rounded-lg bg-white p-4 shadow-sm lg:sticky lg:top-40"><div className="flex items-center gap-3 border-b pb-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-950 text-xl font-black text-white">{user.name?.charAt(0).toUpperCase() || "A"}</span><div className="min-w-0"><p className="truncate text-sm font-black">{user.name}</p><p className="truncate text-[11px] text-slate-500">{user.email}</p><span className="mt-1 inline-block rounded bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase text-orange-600">{user.role}</span></div></div><nav className="mt-3 flex flex-col text-xs"><Link href="/dashboard" className="rounded bg-orange-50 px-3 py-2.5 font-black text-orange-600">Overview</Link><Link href="/profile" className="rounded px-3 py-2.5 hover:bg-slate-50">Account settings</Link>{user.role === "buyer" && <><Link href="/my-requests" className="rounded px-3 py-2.5 hover:bg-slate-50">My requests</Link><Link href="/saved-products" className="rounded px-3 py-2.5 hover:bg-slate-50">Saved products</Link></>}{user.role === "supplier" && <><Link href="/admin/products" className="rounded px-3 py-2.5 hover:bg-slate-50">My products</Link><Link href="/supplier/price-requests" className="rounded px-3 py-2.5 hover:bg-slate-50">Price requests</Link></>}{["admin", "super_admin"].includes(user.role || "") && <><Link href="/requests" className="rounded px-3 py-2.5 hover:bg-slate-50">Buyer requests</Link><Link href="/admin/suppliers" className="rounded px-3 py-2.5 hover:bg-slate-50">Suppliers</Link><Link href="/admin/products" className="rounded px-3 py-2.5 hover:bg-slate-50">Products</Link></>}</nav></aside>
          <div>
        <section className="mb-5 rounded-lg bg-gradient-to-r from-blue-950 to-blue-800 p-5 text-white shadow-sm"><p className="text-sm text-blue-200">Welcome back,</p><h2 className="mt-1 text-2xl font-black">{user.name}</h2><p className="mt-2 text-xs text-blue-100">{user.role === "buyer" ? "Source products, request quotations and track your procurement." : user.role === "supplier" ? "List products, monitor approvals and respond to private sourcing opportunities." : "Control marketplace requests, suppliers, products, quotations and order performance."}</p></section>

        {user?.role === "buyer" && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Buyer centre</h2><Link href="/products" className="text-xs font-bold text-orange-600">Explore marketplace →</Link></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[["⌕", "Browse Products", "Explore Afrilink-reviewed catalogue products.", "/products"], ["◉", "Request Quotation", "Send specifications for managed sourcing.", "/post-request"], ["▤", "My Requests", "Track requests and official quotations.", "/my-requests"], ["♡", "Saved Products", "Return to your product shortlist.", "/saved-products"], ["⚑", "Become a Supplier", "Apply for verified supplier access.", "/become-supplier"]].map(([icon, title, detail, href], index) => <Link key={title} href={href} className={`rounded-lg border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${index === 1 ? "border-orange-500 bg-orange-500 text-white" : "bg-white"}`}><span className="text-2xl">{icon}</span><h3 className="mt-3 font-black">{title}</h3><p className={`mt-1 text-xs leading-relaxed ${index === 1 ? "text-orange-50" : "text-slate-500"}`}>{detail}</p></Link>)}</div></section>}

        {user?.role === "supplier" && <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-black">Supplier partner centre</h2><span className="text-[10px] font-bold text-green-700">✓ APPROVED SUPPLIER ACCESS</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[["＋", "Submit Product", "Add a product with up to four pictures for Afrilink review.", "/admin/products/create"], ["▦", "My Products", "Manage listings, prices and approval status.", "/admin/products"], ["▤", "Factory Price Requests", "Review private RFQs and submit factory offers.", "/supplier/price-requests"]].map(([icon, title, detail, href], index) => <Link key={title} href={href} className={`rounded-lg border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${index === 0 ? "border-orange-500 bg-orange-500 text-white" : "bg-white"}`}><span className="text-2xl">{icon}</span><h3 className="mt-3 font-black">{title}</h3><p className={`mt-1 text-xs leading-relaxed ${index === 0 ? "text-orange-50" : "text-slate-500"}`}>{detail}</p></Link>)}</div><div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-xs text-slate-600"><strong className="text-blue-950">Protected supplier relationship:</strong> buyer-facing prices include Afrilink&apos;s commission, while supplier identity and base pricing remain private.</div></section>}

        {["admin", "super_admin"].includes(user?.role || "") && (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-black">Admin trading control centre</h2><div className="flex gap-2"><Link href="/admin/analytics" className="rounded-full border border-blue-950 bg-white px-4 py-2 text-[10px] font-black text-blue-950 hover:bg-blue-50">Traffic Analytics</Link><Link href="/admin/users" className="rounded-full bg-orange-500 px-4 py-2 text-[10px] font-black text-white hover:bg-orange-600">Manage Users & Customers</Link></div></div>

            {overview && (
              <section className="mb-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    ["Online now", presence?.total ?? 0],
                    ["Buyer requests", overview.requestCount],
                    ["Active orders", overview.activeOrders],
                    ["Supplier approvals", overview.pendingSuppliers],
                    ["Product reviews", overview.pendingProducts],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></div>
                  ))}
                </div>

                {presence && <div className="mt-4 grid gap-4 rounded-lg border border-green-200 bg-green-50 p-4 lg:grid-cols-[1fr_1.4fr]"><div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" /><h3 className="text-sm font-black text-green-950">Live website visitors</h3></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded bg-white p-3"><p className="text-slate-500">Guests</p><p className="mt-1 text-xl font-black">{presence.guests}</p></div><div className="rounded bg-white p-3"><p className="text-slate-500">Signed in</p><p className="mt-1 text-xl font-black">{presence.signedIn}</p></div><div className="rounded bg-white p-3"><p className="text-slate-500">Buyers</p><p className="mt-1 text-xl font-black">{presence.buyers}</p></div><div className="rounded bg-white p-3"><p className="text-slate-500">Suppliers</p><p className="mt-1 text-xl font-black">{presence.suppliers}</p></div></div></div><div><p className="text-xs font-black text-green-950">Pages being viewed now</p><div className="mt-3 space-y-2">{presence.pages.length ? presence.pages.map((item) => <div key={item.page} className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs"><span className="max-w-[80%] truncate font-semibold">{item.page === "/" ? "Homepage" : item.page}</span><span className="rounded-full bg-green-100 px-2 py-0.5 font-black text-green-800">{item.count}</span></div>) : <p className="text-xs text-slate-500">Waiting for visitor activity...</p>}</div><p className="mt-3 text-[10px] text-slate-500">Refreshes automatically every 15 seconds. A visitor is considered online for 90 seconds after their last activity.</p></div></div>}

                {overview.financials.length > 0 && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {overview.financials.map((item) => (
                      <div key={item.currency} className="rounded-lg bg-blue-950 p-5 text-white">
                        <div className="flex items-center justify-between"><h3 className="font-bold">{item.currency} Deal Pipeline</h3><span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-950">{item.quotations} quotes</span></div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-blue-200">Quoted</p><p className="text-xl font-bold">{item.currency} {item.quoted.toLocaleString()}</p></div><div><p className="text-blue-200">Collected</p><p className="text-xl font-bold text-green-300">{item.currency} {item.collected.toLocaleString()}</p></div><div><p className="text-blue-200">Outstanding</p><p className="font-bold text-yellow-300">{item.currency} {item.balance.toLocaleString()}</p></div><div><p className="text-blue-200">Expected gross profit</p><p className="font-bold">{item.currency} {item.grossProfit.toLocaleString()}</p></div></div>
                      </div>
                    ))}
                  </div>
                )}

                {overview.catalogueCommissions.length > 0 && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><strong>Approved catalogue commission opportunity:</strong> {overview.catalogueCommissions.map((item) => `${item.currency} ${item.commission.toLocaleString()}`).join(" · ")}</p>}
              </section>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <Link
                href="/requests"
                className="rounded-lg bg-orange-500 p-5 text-white shadow-sm transition hover:bg-orange-600"
              >
                <h3 className="font-black">Buyer Requests</h3>
                <p className="mt-2 text-sm">
                  Review buyer requests, source suppliers privately, and prepare
                  Afrilink quotations.
                </p>
              </Link>

              <Link
                href="/admin/suppliers"
                className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-black text-blue-950">
                  Supplier Applications
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Approve or reject suppliers before they can partner with
                  Afrilink.
                </p>
              </Link>

              <Link href="/requests" className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md">
                <h3 className="font-black text-blue-950">
                  Create Afrilink Quotation
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Open a buyer request, add supplier cost, shipping, duties, and Afrilink margin.
                </p>
              </Link>

              <Link
                href="/admin/products/create"
                className="rounded-lg bg-blue-950 p-5 text-white shadow-sm transition hover:bg-blue-900"
              >
                <h3 className="font-black">+ Add Product</h3>
                <p className="mt-2 text-sm">
                  Add approved showroom products manually.
                </p>
              </Link>

              <Link
                href="/admin/products"
                className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-black text-blue-950">
                  Manage Products
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  View, edit, approve, and delete showroom products.
                </p>
              </Link>

              <Link href="/requests" className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md">
                <h3 className="font-black text-blue-950">
                  Orders & Payments
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track quotation acceptance, deposits, balances, orders, and delivery.
                </p>
              </Link>
            </div>
          </>
        )}
          </div>
        </div>
      </div>
    </main>
  );
}
