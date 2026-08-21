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

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);

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

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const currentUser = JSON.parse(savedUser) as DashboardUser;
      setUser(currentUser);
      if (["admin", "super_admin"].includes(currentUser.role || "")) {
        apiFetch("/admin/overview")
          .then((data) => setOverview(data.overview))
          .catch((error) => console.error("Failed to load admin overview", error));
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-950">
              Afrilink Trade Control Center
            </h1>

            <p className="text-gray-600 mt-2">
              Afrilink controls buyer requests, supplier sourcing, quotations,
              orders, and margins.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div className="mb-8 bg-gray-100 p-5 rounded-2xl">
          <p className="text-gray-600 text-lg">
            Welcome back,
            <span className="font-bold text-blue-950"> {user?.name}</span>
          </p>

          <p className="text-sm text-gray-500 mt-2">Role: {user?.role}</p>
          <p className="text-sm text-gray-500">Email: {user?.email}</p>
        </div>

        {user?.role === "buyer" && (
          <>
            <h2 className="text-2xl font-bold text-blue-950 mb-4">
              Buyer Center
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/products"
                className="bg-blue-950 text-white p-6 rounded-2xl shadow hover:bg-yellow-400 hover:text-black transition"
              >
                <h3 className="text-xl font-bold">Browse Products</h3>
                <p className="mt-2 text-sm">
                  View approved products from Afrilink Capital.
                </p>
              </Link>

              <Link
                href="/post-request"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  Request Quotation
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Send your request to Afrilink Capital. No supplier contact is
                  shared.
                </p>
              </Link>

              <Link
                href="/requests"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  My Requests
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track your requests and official Afrilink quotations.
                </p>
              </Link>

              <Link
                href="/become-supplier"
                className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">Become a Supplier</h3>
                <p className="mt-2 text-sm text-gray-600">Submit your company for Afrilink verification and unlock product listing after approval.</p>
              </Link>
            </div>
          </>
        )}

        {user?.role === "supplier" && (
          <>
            <h2 className="text-2xl font-bold text-blue-950 mb-4">
              Supplier Partner Center
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/admin/products/create"
                className="bg-blue-950 text-white p-6 rounded-2xl shadow hover:bg-yellow-400 hover:text-black transition"
              >
                <h3 className="text-xl font-bold">Submit Product</h3>
                <p className="mt-2 text-sm">
                  Add products for Afrilink review. Buyers will not see your
                  contact details.
                </p>
              </Link>

              <Link
                href="/admin/products"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  My Products
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage products submitted to Afrilink.
                </p>
              </Link>

              <div className="bg-white border p-6 rounded-2xl shadow">
                <h3 className="text-xl font-bold text-blue-950">
                  Factory Price Requests
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Coming soon: Afrilink will request supplier pricing privately.
                </p>
              </div>
            </div>
          </>
        )}

        {["admin", "super_admin"].includes(user?.role || "") && (
          <>
            <h2 className="text-2xl font-bold text-blue-950 mb-4">
              Admin Trading Control Center
            </h2>

            {overview && (
              <section className="mb-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Buyer requests", overview.requestCount],
                    ["Active orders", overview.activeOrders],
                    ["Supplier approvals", overview.pendingSuppliers],
                    ["Product reviews", overview.pendingProducts],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-gray-200 bg-gray-50 p-5"><p className="text-sm font-semibold text-gray-600">{label}</p><p className="mt-2 text-3xl font-bold text-blue-950">{value}</p></div>
                  ))}
                </div>

                {overview.financials.length > 0 && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {overview.financials.map((item) => (
                      <div key={item.currency} className="rounded-2xl bg-blue-950 p-5 text-white">
                        <div className="flex items-center justify-between"><h3 className="font-bold">{item.currency} Deal Pipeline</h3><span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-950">{item.quotations} quotes</span></div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-blue-200">Quoted</p><p className="text-xl font-bold">{item.currency} {item.quoted.toLocaleString()}</p></div><div><p className="text-blue-200">Collected</p><p className="text-xl font-bold text-green-300">{item.currency} {item.collected.toLocaleString()}</p></div><div><p className="text-blue-200">Outstanding</p><p className="font-bold text-yellow-300">{item.currency} {item.balance.toLocaleString()}</p></div><div><p className="text-blue-200">Expected gross profit</p><p className="font-bold">{item.currency} {item.grossProfit.toLocaleString()}</p></div></div>
                      </div>
                    ))}
                  </div>
                )}

                {overview.catalogueCommissions.length > 0 && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"><strong>Approved catalogue commission opportunity:</strong> {overview.catalogueCommissions.map((item) => `${item.currency} ${item.commission.toLocaleString()}`).join(" · ")}</p>}
              </section>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/requests"
                className="bg-blue-950 text-white p-6 rounded-2xl shadow hover:bg-yellow-400 hover:text-black transition"
              >
                <h3 className="text-xl font-bold">Buyer Requests</h3>
                <p className="mt-2 text-sm">
                  Review buyer requests, source suppliers privately, and prepare
                  Afrilink quotations.
                </p>
              </Link>

              <Link
                href="/admin/suppliers"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  Supplier Applications
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Approve or reject suppliers before they can partner with
                  Afrilink.
                </p>
              </Link>

              <Link href="/requests" className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-blue-950">
                  Create Afrilink Quotation
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Open a buyer request, add supplier cost, shipping, duties, and Afrilink margin.
                </p>
              </Link>

              <Link
                href="/admin/products/create"
                className="bg-green-600 text-white p-6 rounded-2xl shadow hover:bg-green-700 transition"
              >
                <h3 className="text-xl font-bold">+ Add Product</h3>
                <p className="mt-2 text-sm">
                  Add approved showroom products manually.
                </p>
              </Link>

              <Link
                href="/admin/products"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  Manage Products
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  View, edit, approve, and delete showroom products.
                </p>
              </Link>

              <Link href="/requests" className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-blue-950">
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
    </main>
  );
}
