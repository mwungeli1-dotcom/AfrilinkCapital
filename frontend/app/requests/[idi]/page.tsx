"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/src/lib/api";
import { downloadQuotationPdf, type PdfQuotation } from "@/src/lib/quotationPdf";
import toast from "react-hot-toast";

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

type DealQuotation = PdfQuotation & {
  _id: string;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  paymentStatus?: "Unpaid" | "Partially Paid" | "Paid" | "Refunded";
  amountPaid?: number;
  paymentMethod?: string;
  paymentReference?: string;
};

export default function RequestDetails() {
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [quotations, setQuotations] = useState<DealQuotation[]>([]);
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, { amount: string; method: string; reference: string }>>({});
  const [updatingId, setUpdatingId] = useState("");
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

  async function updateQuotationStatus(quotationId: string, status: DealQuotation["status"]) {
    setUpdatingId(quotationId);
    try {
      const data = await apiFetch(`/quotations/${quotationId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setQuotations((current) => current.map((item) => item._id === quotationId ? data.quotation : item));
      if (status === "Sent") setRequest((current) => current ? { ...current, status: "Quotation Ready" } : current);
      if (status === "Accepted") setRequest((current) => current ? { ...current, status: "Awaiting Deposit" } : current);
      if (status === "Rejected") setRequest((current) => current ? { ...current, status: "Reviewing" } : current);
      toast.success(`Quotation marked ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update quotation");
    } finally {
      setUpdatingId("");
    }
  }

  async function updatePayment(quotation: DealQuotation) {
    const draft = paymentDrafts[quotation._id] || { amount: String(quotation.amountPaid || 0), method: quotation.paymentMethod || "", reference: quotation.paymentReference || "" };
    setUpdatingId(quotation._id);
    try {
      const data = await apiFetch(`/quotations/${quotation._id}/payment`, {
        method: "PUT",
        body: JSON.stringify({ amountPaid: Number(draft.amount), paymentMethod: draft.method, paymentReference: draft.reference }),
      });
      setQuotations((current) => current.map((item) => item._id === quotation._id ? data.quotation : item));
      if (Number(draft.amount) > 0) setRequest((current) => current ? { ...current, status: "Ordered" } : current);
      toast.success("Payment record updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record payment");
    } finally {
      setUpdatingId("");
    }
  }

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
            <div className="mt-5 space-y-4">{quotations.map((quotation) => {
              const draft = paymentDrafts[quotation._id] || { amount: String(quotation.amountPaid || 0), method: quotation.paymentMethod || "", reference: quotation.paymentReference || "" };
              const balance = Math.max(quotation.totalAmount - (quotation.amountPaid || 0), 0);
              return (
              <div key={quotation._id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div><p className="font-bold text-blue-950">{quotation.quotationNumber}</p><p className="text-sm text-gray-600">{quotation.deliveryTime}</p></div>
                  <div className="text-right"><p className="font-bold">{quotation.currency} {quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <button onClick={() => downloadQuotationPdf(quotation, request)} className="text-sm font-semibold text-blue-700 hover:underline">Download PDF</button></div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label><span className="mb-1 block text-xs font-bold text-gray-600">BUYER RESPONSE</span><select disabled={updatingId === quotation._id} className="w-full rounded-lg border bg-white p-2" value={quotation.status} onChange={(event) => updateQuotationStatus(quotation._id, event.target.value as DealQuotation["status"])}><option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option><option>Expired</option></select></label>
                  <div className="rounded-lg bg-white p-3"><p className="text-xs font-bold text-gray-600">PAYMENT</p><p className="font-semibold">{quotation.paymentStatus || "Unpaid"}</p></div>
                  <div className="rounded-lg bg-white p-3"><p className="text-xs font-bold text-gray-600">BALANCE</p><p className="font-semibold">{quotation.currency} {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                </div>

                <div className="mt-3 grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <label><span className="mb-1 block text-xs font-bold text-blue-900">TOTAL RECEIVED</span><input type="number" min="0" max={quotation.totalAmount} step="0.01" className="w-full rounded-lg border p-2" value={draft.amount} onChange={(event) => setPaymentDrafts((current) => ({ ...current, [quotation._id]: { ...draft, amount: event.target.value } }))} /></label>
                  <label><span className="mb-1 block text-xs font-bold text-blue-900">METHOD</span><select className="w-full rounded-lg border bg-white p-2" value={draft.method} onChange={(event) => setPaymentDrafts((current) => ({ ...current, [quotation._id]: { ...draft, method: event.target.value } }))}><option value="">Select method</option><option>Bank Transfer</option><option>Mobile Money</option><option>Cash</option><option>Card</option><option>Other</option></select></label>
                  <label><span className="mb-1 block text-xs font-bold text-blue-900">REFERENCE</span><input className="w-full rounded-lg border p-2" placeholder="Transaction ID" value={draft.reference} onChange={(event) => setPaymentDrafts((current) => ({ ...current, [quotation._id]: { ...draft, reference: event.target.value } }))} /></label>
                  <button disabled={updatingId === quotation._id} onClick={() => updatePayment(quotation)} className="self-end rounded-lg bg-blue-950 px-4 py-2 font-semibold text-white disabled:opacity-60">Record</button>
                </div>
              </div>
            )})}</div>}
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
