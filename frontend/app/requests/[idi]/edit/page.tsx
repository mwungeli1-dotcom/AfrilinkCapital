"use client";

import { useEffect, useState } from "react";

export default function EditRequestPage() {
  const [id, setId] = useState("");

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Received");

  const statuses = [
    "Received",
    "Reviewing",
    "Sourcing Supplier",
    "Quotation Ready",
    "Awaiting Deposit",
    "Ordered",
    "Shipping",
    "Delivered",
  ];

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    const requestId = parts[2];

    setId(requestId);
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchRequest() {
      try {
        const res = await fetch(`http://localhost:5000/requests/${id}`);
        const data = await res.json();

        const request = data.request || data;

        setTitle(request.title || "");
        setCountry(request.country || "");
        setQuantity(request.quantity || "");
        setDescription(request.description || "");
        setStatus(request.status || "Received");
      } catch (error) {
        console.error(error);
        alert("Failed to load request");
      }
    }

    fetchRequest();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!id) {
      alert("Request ID missing");
      return;
    }

    const res = await fetch(`http://localhost:5000/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        country,
        quantity,
        description,
        status,
      }),
    });

    const data = await res.json();

    if (data.success || res.ok) {
      alert("Request updated successfully!");
      window.location.href = `/requests/${id}`;
    } else {
      alert(data.message || "Failed to update request");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => (window.location.href = `/requests/${id}`)}
          className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Edit Procurement Request
        </h1>

        <p className="text-gray-600 mb-6">
          Update request details and procurement status.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold">Product Title</label>
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Country</label>
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Quantity</label>
            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Procurement Status
            </label>

            <select
              className="w-full border p-3 rounded-lg"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">Description</label>
            <textarea
              className="w-full border p-3 rounded-lg h-36"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
}