"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import { useParams } from "next/navigation";

export default function EditRequestPage() {
  const { idi: id } = useParams<{ idi: string }>();

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
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
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      alert("Admin login required");
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(savedUser);

    if (user.role !== "admin") {
      alert("Admin access required");
      window.location.href = "/";
      return;
    }

  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchRequest() {
      try {
        const data = await apiFetch(`/requests/${id}`);

        const request = data.request || data;

        setTitle(request.title || "");
        setCustomerName(request.customerName || "");
        setPhone(request.phone || "");
        setEmail(request.email || "");
        setDeliveryLocation(request.deliveryLocation || "");
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

    try {
      await apiFetch(`/requests/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          customerName,
          phone,
          email,
          deliveryLocation,
          title,
          country,
          quantity,
          description,
          status,
        }),
      });

      alert("Request updated successfully!");
      window.location.href = `/requests/${id}`;
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to update request");
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
          <div className="grid gap-4 rounded-xl bg-blue-50 p-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-semibold">Customer Name</label>
              <input className="w-full border p-3 rounded-lg" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Phone / WhatsApp</label>
              <input className="w-full border p-3 rounded-lg" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Email</label>
              <input type="email" className="w-full border p-3 rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Delivery Town / Area</label>
              <input className="w-full border p-3 rounded-lg" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
            </div>
          </div>

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
