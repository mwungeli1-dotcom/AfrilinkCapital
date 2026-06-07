"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type RequestItem = {
  _id: string;
  title: string;
  country: string;
  quantity: string;
  description?: string;
  status?: string;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin login required");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    async function fetchRequests() {
      try {
        const res = await fetch("http://afrilinkcapital.onrender.com/requests");
        const data = await res.json();

        console.log("REQUESTS DATA:", data);

        setRequests(data.requests || data || []);
        setLoading(false);
      } catch (error) {
        console.error("FETCH ERROR:", error);
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) =>
    request.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-bold text-blue-950 animate-pulse">
          Loading requests...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-900 mb-2">
        Afrilink Admin Requests
      </h1>

      <p className="text-gray-600 mb-8">
        Admin area for managing procurement requests from inquiry to sourcing,
        quotation, shipping, and delivery.
      </p>

      <input
        type="text"
        placeholder="Search requests..."
        className="w-full p-4 mb-6 border rounded-xl"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredRequests.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            No Requests Found
          </h2>

          <p className="text-gray-600">
            No procurement requests were returned from the server.
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {filteredRequests.map((request) => {
          const currentStatus = request.status || "Received";

          return (
            <div
              key={request._id}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-950">
                    {request.title}
                  </h2>

                  <p className="text-gray-600">
                    Country: {request.country}
                  </p>

                  <p className="text-gray-600">
                    Quantity: {request.quantity}
                  </p>
                </div>

                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {currentStatus}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  "Received",
                  "Reviewing",
                  "Sourcing Supplier",
                  "Quotation Ready",
                  "Awaiting Deposit",
                  "Ordered",
                  "Shipping",
                  "Delivered",
                ].map((status) => (
                  <div
                    key={status}
                    className={`p-2 rounded text-center ${
                      status === currentStatus
                        ? "bg-blue-900 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </div>
                ))}
              </div>

              <a
                href={`/requests/${request._id}`}
                className="inline-block mt-5 bg-blue-900 text-white px-4 py-2 rounded-lg"
              >
                View Details
              </a>
            </div>
          );
        })}
      </div>
    </main>
  );
}