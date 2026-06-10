"use client";

import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role !== "admin") {
      window.location.href = "/login";
      return;
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Menu</h1>

      <div className="grid gap-4">
        <a
          href="/admin/products"
          className="bg-black text-white p-4 rounded-lg text-center"
        >
          Manage Products
        </a>

        <a
          href="/dashboard"
          className="bg-blue-600 text-white p-4 rounded-lg text-center"
        >
          Dashboard
        </a>

        <a
          href="/requests"
          className="bg-green-600 text-white p-4 rounded-lg text-center"
        >
          Manage Requests
        </a>
      </div>
    </main>
  );
}