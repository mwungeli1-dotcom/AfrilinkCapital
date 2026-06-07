"use client";

import { useEffect, useState } from "react";

export default function RequestDetails() {
  const [request, setRequest] = useState<any>(null);
  const [error, setError] = useState("");

  const id =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : "";

  useEffect(() => {
    if (!id) return;

    async function fetchRequest() {
      try {
        const res = await fetch(`http://localhost:5000/requests/${id}`);
        const data = await res.json();

        console.log("DETAIL DATA:", data);

        if (data.request) {
          setRequest(data.request);
        } else if (data._id) {
          setRequest(data);
        } else {
          setError("Request data not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load request details");
      }
    }

    fetchRequest();
  }, [id]);

  if (error) {
    return <main className="p-8 text-red-600">{error}</main>;
  }

  if (!request) {
    return <main className="p-8">Loading request details...</main>;
  }

  const currentStatus = request.status || "Received";

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => (window.location.href = "/requests")}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>

          <a
            href={`/requests/${id}/edit`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </a>
        </div>

        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          {request.title}
        </h1>

        <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          {currentStatus}
        </span>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Country</strong>
            <p>{request.country}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Quantity</strong>
            <p>{request.quantity}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Date Submitted</strong>
            <p>
              {request.createdAt
                ? new Date(request.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-blue-950 mb-2">
          Product Description
        </h2>

        <p className="text-gray-700 mb-8">
          {request.description || "No description provided"}
        </p>

        <div className="bg-blue-50 p-5 rounded-xl">
          <h2 className="text-lg font-bold text-blue-950 mb-2">
            Afrilink Capital Handling
          </h2>

          <p className="text-gray-700">
            Afrilink Capital will review this request, confirm specifications,
            source suppliers, negotiate pricing, prepare quotation, manage
            shipping, customs clearance, and delivery.
          </p>
        </div>
      </div>
    </main>
  );
}