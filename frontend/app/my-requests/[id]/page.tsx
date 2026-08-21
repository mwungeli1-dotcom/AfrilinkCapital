"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";
import { downloadQuotationPdf, type PdfQuotation, type PdfRequest } from "@/src/lib/quotationPdf";

type Quotation = PdfQuotation & {
  _id: string;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  balance: number;
};

type RequestItem = PdfRequest & {
  _id: string;
  status?: string;
  createdAt: string;
};

const money = (value: number, currency: string) => `${currency} ${Number(value || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2 })}`;

export default function MyRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch(`/my/requests/${id}`);
      setRequest(data.request);
      setQuotations(data.quotations || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    apiFetch(`/my/requests/${id}`)
      .then((data) => {
        setRequest(data.request);
        setQuotations(data.quotations || []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [id]);

  const respond = async (quotationId: string, status: "Accepted" | "Rejected") => {
    if (!window.confirm(`${status} this quotation?`)) return;
    setUpdating(quotationId);
    try {
      const data = await apiFetch(`/my/quotations/${quotationId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      toast.success(data.message);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update quotation");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <main className="min-h-screen bg-slate-50 p-12 text-center">Loading request...</main>;
  if (!request) return <main className="min-h-screen bg-slate-50 p-12 text-center"><h1 className="text-2xl font-bold text-blue-950">Request not found</h1><Link href="/my-requests" className="mt-4 inline-block text-blue-700 underline">Back to my requests</Link></main>;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/my-requests" className="font-semibold text-blue-700 hover:underline">← My Requests</Link>
        <section className="mt-5 rounded-2xl bg-blue-950 p-7 text-white shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="text-sm text-blue-200">Procurement request</p><h1 className="mt-1 text-3xl font-bold">{request.title}</h1><p className="mt-3 text-blue-100">{request.quantity} • {request.country}</p></div>
            <span className="w-fit rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-blue-950">{request.status || "Received"}</span>
          </div>
          {request.description && <p className="mt-5 border-t border-blue-800 pt-5 text-blue-100">{request.description}</p>}
        </section>

        <h2 className="mb-4 mt-10 text-2xl font-bold text-blue-950">Official quotations</h2>
        {quotations.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-slate-600">Afrilink is reviewing your request. Your official quotation will appear here when ready.</div>
        ) : quotations.map((quotation) => (
          <article key={quotation._id} className="mb-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-semibold text-slate-500">{quotation.quotationNumber}</p><p className="mt-1 text-3xl font-bold text-blue-950">{money(quotation.totalAmount, quotation.currency)}</p><p className="mt-1 text-sm text-slate-600">Estimated delivery: {quotation.deliveryTime}</p></div>
              <div className="text-left sm:text-right"><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{quotation.status}</span><p className="mt-3 text-sm text-slate-600">Payment: {quotation.paymentStatus}</p></div>
            </div>
            <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
              <div><p className="text-xs text-slate-500">Paid</p><p className="font-bold text-slate-900">{money(quotation.amountPaid, quotation.currency)}</p></div>
              <div><p className="text-xs text-slate-500">Balance</p><p className="font-bold text-slate-900">{money(quotation.balance, quotation.currency)}</p></div>
              <div><p className="text-xs text-slate-500">Valid for</p><p className="font-bold text-slate-900">{quotation.validityDays} days</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => downloadQuotationPdf(quotation, request)} className="rounded-lg border border-blue-950 px-4 py-2 font-semibold text-blue-950 hover:bg-blue-50">Download PDF</button>
              {quotation.status === "Sent" && <><button disabled={updating === quotation._id} onClick={() => respond(quotation._id, "Accepted")} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Accept quotation</button><button disabled={updating === quotation._id} onClick={() => respond(quotation._id, "Rejected")} className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-700 disabled:opacity-50">Reject</button></>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
