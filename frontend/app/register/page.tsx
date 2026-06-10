"use client";

import { apiFetch } from "../../src/lib/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (data.success) {
        toast.success("Account created successfully!");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error(data.message || "Registration failed");
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
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <select
            className="w-full border p-3 rounded-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="supplier">Supplier</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-950 text-white p-3 rounded-lg hover:bg-yellow-400 hover:text-black transition"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}