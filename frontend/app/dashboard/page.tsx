"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (!savedToken) {
      toast.error("Please login first");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    setToken(savedToken);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
              Afrilink Dashboard
            </h1>

            <p className="text-gray-600 mt-2">
              Manage procurement, products, requests, and platform operations.
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
              Buyer Actions
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/products"
                className="bg-blue-950 text-white p-6 rounded-2xl shadow hover:bg-yellow-400 hover:text-black transition"
              >
                Browse Products
              </Link>

              <Link
                href="/post-request"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                Request Quotation
              </Link>

              <Link
                href="/requests"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                View My Requests
              </Link>
            </div>
          </>
        )}

        {user?.role === "supplier" && (
          <>
            <h2 className="text-2xl font-bold text-blue-950 mb-4">
              Supplier Actions
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/requests"
                className="bg-blue-950 text-white p-6 rounded-2xl shadow hover:bg-yellow-400 hover:text-black transition"
              >
                Browse Buyer Requests
              </Link>

              <div className="bg-white border p-6 rounded-2xl shadow">
                Send Quotations Coming Soon
              </div>
            </div>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <h2 className="text-2xl font-bold text-blue-950 mb-4">
              Admin Control Center
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link
                href="/admin/products/create"
                className="bg-green-600 text-white p-6 rounded-2xl shadow hover:bg-green-700 transition"
              >
                <h3 className="text-xl font-bold">+ Add Product</h3>
                <p className="mt-2 text-sm">
                  Add a new product to Afrilink Hub showroom.
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
                  View, edit, and delete showroom products.
                </p>
              </Link>

              <Link
                href="/requests"
                className="bg-white border p-6 rounded-2xl shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-950">
                  Manage Requests
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track procurement requests and update statuses.
                </p>
              </Link>

              <div className="bg-white border p-6 rounded-2xl shadow">
                <h3 className="text-xl font-bold text-blue-950">
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  User management coming soon.
                </p>
              </div>

              <div className="bg-white border p-6 rounded-2xl shadow">
                <h3 className="text-xl font-bold text-blue-950">
                  Quotations
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Quotation management coming soon.
                </p>
              </div>

              <div className="bg-white border p-6 rounded-2xl shadow">
                <h3 className="text-xl font-bold text-blue-950">
                  Platform Settings
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  System settings coming soon.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}