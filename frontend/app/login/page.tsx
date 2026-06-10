"use client";

import { apiFetch } from "../../src/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.success) {
        toast.success("Login successful!");

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          if (data.user.role === "admin") {
            if (data.user.role === "admin") {
  window.location.href = "/dashboard";
} else {
  window.location.href = "/";
}
        }, 1000);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Cannot connect to server");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-blue-950 mb-6">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-950 text-white p-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Login
          </button>

        </form>
      </div>
    </main>
  );
}