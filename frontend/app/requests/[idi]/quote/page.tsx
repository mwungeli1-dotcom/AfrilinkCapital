"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function QuotePage() {
  const requestId = window.location.pathname.split("/")[2];

  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/quotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierName,
        supplierEmail,
        requestId,
        price,
        message,
      }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success("Quotation submitted successfully!");

      setTimeout(() => {
        window.location.href = `/requests/${requestId}`;
      }, 1000);
    } else {
      toast.error("Failed to submit quotation");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-6">
          Submit Quotation
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Supplier Email"
            type="email"
            value={supplierEmail}
            onChange={(e) => setSupplierEmail(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Price / Quotation Amount"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <textarea
            className="w-full border p-3 rounded-lg h-36"
            placeholder="Quotation message, delivery time, product details..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button className="bg-blue-950 text-white px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-black transition">
            Submit Quotation
          </button>
        </form>
      </div>
    </main>
  );
}