"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("https://afrilinkcapital.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Login successful!");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      toast.error(data.message || "Login failed");
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
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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