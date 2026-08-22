"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type Rfq = {
  _id: string;
  message: string;
  deadline?: string;
  status: "Sent" | "Responded" | "Selected" | "Closed";
  currency?: "USD" | "ZMW";
  unitPrice?: number;
  totalPrice?: number;
  minimumOrderQuantity?: string;
  leadTime?: string;
  shippingTerms?: string;
  notes?: string;
  requestId: { title: string; description?: string; quantity?: string; country?: string; deliveryLocation?: string };
};

type Draft = { currency: "USD" | "ZMW"; unitPrice: string; totalPrice: string; minimumOrderQuantity: string; leadTime: string; shippingTerms: string; notes: string };

export default function SupplierPriceRequestsPage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  const load = () => apiFetch("/supplier/rfqs")
    .then((data) => setRfqs(data.rfqs || []))
    .catch((error) => toast.error(error.message))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const draftFor = (rfq: Rfq): Draft => drafts[rfq._id] || {
    currency: rfq.currency || "USD",
    unitPrice: rfq.unitPrice ? String(rfq.unitPrice) : "",
    totalPrice: rfq.totalPrice ? String(rfq.totalPrice) : "",
    minimumOrderQuantity: rfq.minimumOrderQuantity || "",
    leadTime: rfq.leadTime || "",
    shippingTerms: rfq.shippingTerms || "EXW",
    notes: rfq.notes || "",
  };

  const updateDraft = (rfq: Rfq, field: keyof Draft, value: string) => {
    setDrafts((current) => ({ ...current, [rfq._id]: { ...draftFor(rfq), [field]: value } }));
  };

  const submit = async (rfq: Rfq) => {
    setSaving(rfq._id);
    try {
      const data = await apiFetch(`/supplier/rfqs/${rfq._id}/respond`, { method: "PUT", body: JSON.stringify(draftFor(rfq)) });
      toast.success(data.message);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit offer");
    } finally { setSaving(""); }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold uppercase tracking-[0.2em] text-yellow-600">Supplier partner portal</p>
        <h1 className="mt-2 text-4xl font-bold text-blue-950">Factory Price Requests</h1>
        <p className="mt-2 text-slate-600">Submit confidential offers directly to Afrilink. Buyers never see your identity or factory price.</p>

        {loading ? <div className="mt-8 rounded-2xl bg-white p-8">Loading requests...</div> : rfqs.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center"><h2 className="text-2xl font-bold text-blue-950">No price requests yet</h2><p className="mt-2 text-slate-600">Afrilink sourcing opportunities sent to your company will appear here.</p></div>
        ) : <div className="mt-8 space-y-6">{rfqs.map((rfq) => {
          const draft = draftFor(rfq);
          return <article key={rfq._id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><div><h2 className="text-2xl font-bold text-blue-950">{rfq.requestId?.title || "Procurement request"}</h2><p className="mt-1 text-slate-600">Quantity: {rfq.requestId?.quantity || "Confirm with Afrilink"} • Destination: {rfq.requestId?.deliveryLocation || rfq.requestId?.country}</p></div><span className="h-fit w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800">{rfq.status}</span></div>
            {rfq.requestId?.description && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-700">{rfq.requestId.description}</p>}
            <p className="mt-4 text-sm text-blue-900"><strong>Afrilink note:</strong> {rfq.message}</p>
            {rfq.deadline && <p className="mt-1 text-sm text-red-700"><strong>Reply by:</strong> {new Date(rfq.deadline).toLocaleDateString("en-GB")}</p>}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label><span className="mb-1 block text-sm font-bold">Currency</span><select className="w-full rounded-lg border bg-white p-3" value={draft.currency} onChange={(e) => updateDraft(rfq, "currency", e.target.value)}><option>USD</option><option>ZMW</option></select></label>
              <label><span className="mb-1 block text-sm font-bold">Factory unit price</span><input type="number" min="0" step="0.01" className="w-full rounded-lg border p-3" value={draft.unitPrice} onChange={(e) => updateDraft(rfq, "unitPrice", e.target.value)} /></label>
              <label><span className="mb-1 block text-sm font-bold">Total factory offer</span><input type="number" min="0" step="0.01" className="w-full rounded-lg border p-3" value={draft.totalPrice} onChange={(e) => updateDraft(rfq, "totalPrice", e.target.value)} /></label>
              <label><span className="mb-1 block text-sm font-bold">Minimum order quantity</span><input className="w-full rounded-lg border p-3" placeholder="e.g. 100 units" value={draft.minimumOrderQuantity} onChange={(e) => updateDraft(rfq, "minimumOrderQuantity", e.target.value)} /></label>
              <label><span className="mb-1 block text-sm font-bold">Production lead time</span><input className="w-full rounded-lg border p-3" placeholder="e.g. 15 days" value={draft.leadTime} onChange={(e) => updateDraft(rfq, "leadTime", e.target.value)} /></label>
              <label><span className="mb-1 block text-sm font-bold">Shipping terms</span><select className="w-full rounded-lg border bg-white p-3" value={draft.shippingTerms} onChange={(e) => updateDraft(rfq, "shippingTerms", e.target.value)}><option>EXW</option><option>FOB</option><option>CIF</option><option>DDP</option><option>Other</option></select></label>
              <label><span className="mb-1 block text-sm font-bold">Supplier notes</span><input className="w-full rounded-lg border p-3" placeholder="Packaging, warranty, validity..." value={draft.notes} onChange={(e) => updateDraft(rfq, "notes", e.target.value)} /></label>
            </div>
            <button disabled={saving === rfq._id || ["Selected", "Closed"].includes(rfq.status)} onClick={() => submit(rfq)} className="mt-5 rounded-xl bg-blue-950 px-5 py-3 font-bold text-white disabled:opacity-50">{rfq.status === "Responded" ? "Update confidential offer" : rfq.status === "Selected" ? "Offer selected by Afrilink" : "Submit confidential offer"}</button>
          </article>;
        })}</div>}
      </div>
    </main>
  );
}
