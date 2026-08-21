"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type RequestItem = {
  _id: string;
  title: string;
  quantity: string;
  country: string;
  status?: string;
  createdAt: string;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    apiFetch("/my/requests")
      .then((data) => setRequests(data.requests || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-yellow-600">Buyer portal</p>
            <h1 className="mt-2 text-4xl font-bold text-blue-950">My Requests</h1>
            <p className="mt-2 text-slate-600">Track your sourcing requests and official Afrilink quotations.</p>
          </div>
          <Link href="/post-request" className="rounded-xl bg-blue-950 px-5 py-3 text-center font-semibold text-white hover:bg-blue-800">
            New request
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-blue-950">No linked requests yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">Requests you submit while signed in will appear here. Older guest requests remain safely with Afrilink support.</p>
            <Link href="/post-request" className="mt-6 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-bold text-blue-950">Request a quotation</Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {requests.map((request) => (
              <Link key={request._id} href={`/my-requests/${request._id}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-blue-950">{request.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{request.quantity} • {request.country}</p>
                    <p className="mt-2 text-xs text-slate-500">Submitted {new Date(request.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <span className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800">{request.status || "Received"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
