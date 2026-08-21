"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/src/lib/api";
import { downloadQuotationPdf, type PdfQuotation } from "@/src/lib/quotationPdf";

type RequestItem = {
  title: string;
  customerName?: string;
  phone?: string;
  email?: string;
  deliveryLocation?: string;
  country?: string;
  quantity?: string;
  description?: string;
  status?: string;
  createdAt?: string;
};

export default function RequestDetails() {
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [quotations, setQuotations] = useState<Array<PdfQuotation & { _id: string; status: string }>>([]);
  const [error, setError] = useState("");
  const { idi: id } = useParams<{ idi: string }>();

  useEffect(() => {
    if (!id) return;

    async function fetchRequest() {
      try {
        const [data, quotationData] = await Promise.all([
          apiFetch(`/requests/${id}`),
          apiFetch(`/requests/${id}/quotations`),
        ]);

        console.log("DETAIL DATA:", data);

        if (data.request) {
          setRequest(data.request);
        } else if (data._id) {
          setRequest(data);
        } else {
          setError("Request data not found");
        }
        setQuotations(quotationData.quotations || []);
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
          <a
            href={`/requests/${id}/quote`}
            className="bg-blue-950 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
          >
            Create Quotation
          </a>
        </div>

        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          {request.title}
        </h1>

        <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          {currentStatus}
        </span>

        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="text-xl font-bold text-blue-950">Customer Contact</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div><strong>Name</strong><p>{request.customerName || "Legacy request"}</p></div>
            <div><strong>Delivery Area</strong><p>{request.deliveryLocation || "Not provided"}</p></div>
            <div>
              <strong>Phone / WhatsApp</strong>
              <p>{request.phone ? <a className="text-green-700 hover:underline" href={`tel:${request.phone}`}>{request.phone}</a> : "Not provided"}</p>
            </div>
            <div>
              <strong>Email</strong>
              <p>{request.email ? <a className="text-blue-700 hover:underline" href={`mailto:${request.email}`}>{request.email}</a> : "Not provided"}</p>
            </div>
          </div>
        </div>

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

        <section className="mb-8 rounded-2xl border border-gray-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-bold text-blue-950">Afrilink Quotations</h2><p className="text-sm text-gray-600">Private costing and official buyer totals.</p></div>
            <a href={`/requests/${id}/quote`} className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-blue-950">New quotation</a>
          </div>
          {quotations.length === 0 ? <p className="mt-5 rounded-xl bg-gray-50 p-4 text-gray-600">No quotation created yet.</p> :
            <div className="mt-5 space-y-3">{quotations.map((quotation) => (
              <div key={quotation._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 p-4">
                <div><p className="font-bold text-blue-950">{quotation.quotationNumber}</p><p className="text-sm text-gray-600">{quotation.status} · {quotation.deliveryTime}</p></div>
                <div className="text-right"><p className="font-bold">{quotation.currency} {quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <button onClick={() => downloadQuotationPdf(quotation, request)} className="text-sm font-semibold text-blue-700 hover:underline">Download PDF</button></div>
              </div>
            ))}</div>}
        </section>

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
