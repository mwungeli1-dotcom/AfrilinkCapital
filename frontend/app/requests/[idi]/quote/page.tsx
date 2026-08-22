"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";
import { downloadQuotationPdf, type PdfQuotation, type PdfRequest } from "@/src/lib/quotationPdf";

type MoneyField = "supplierCost" | "freightCost" | "customsCost" | "serviceFee" | "markupAmount";

export default function QuotePage() {
  const { idi: requestId } = useParams<{ idi: string }>();
  const [request, setRequest] = useState<PdfRequest | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [currency, setCurrency] = useState<"ZMW" | "USD">("ZMW");
  const [amounts, setAmounts] = useState<Record<MoneyField, string>>({
    supplierCost: "", freightCost: "0", customsCost: "0", serviceFee: "0", markupAmount: "0",
  });
  const [deliveryTime, setDeliveryTime] = useState("");
  const [validityDays, setValidityDays] = useState("14");
  const [terms, setTerms] = useState("70% deposit, 30% before delivery.");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"Draft" | "Sent">("Draft");
  const [saving, setSaving] = useState(false);
  const [sourceRfqId, setSourceRfqId] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");

  useEffect(() => {
    apiFetch(`/requests/${requestId}`)
      .then((data) => setRequest(data.request || data))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load request"));

    const rfqId = new URLSearchParams(window.location.search).get("rfq");
    if (rfqId) {
      apiFetch(`/admin/supplier-rfqs/${rfqId}`)
        .then((data) => {
          const rfq = data.rfq;
          if (String(rfq.requestId?._id || rfq.requestId) !== requestId || rfq.status !== "Responded" || !rfq.totalPrice) {
            throw new Error("This supplier offer cannot be selected");
          }
          setSourceRfqId(rfq._id);
          setSourceLabel(`${rfq.supplierId?.companyName || rfq.supplierId?.name} — ${rfq.currency} ${Number(rfq.totalPrice).toLocaleString()}`);
          setSupplierName(rfq.supplierId?.companyName || rfq.supplierId?.name || "");
          setSupplierEmail(rfq.supplierId?.email || "");
          setCurrency(rfq.currency);
          setDeliveryTime(rfq.leadTime || "");
          setAmounts((current) => ({ ...current, supplierCost: String(rfq.totalPrice), markupAmount: String(Math.round(Number(rfq.totalPrice) * 0.2 * 100) / 100) }));
        })
        .catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load supplier offer"));
    }
  }, [requestId]);

  const total = useMemo(
    () => Object.values(amounts).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [amounts]
  );
  const baseCost = (Number(amounts.supplierCost) || 0) + (Number(amounts.freightCost) || 0) + (Number(amounts.customsCost) || 0);
  const grossProfit = (Number(amounts.serviceFee) || 0) + (Number(amounts.markupAmount) || 0);
  const marginPercent = total > 0 ? (grossProfit / total) * 100 : 0;

  const setMoney = (field: MoneyField, value: string) =>
    setAmounts((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!request) return;
    if (!supplierName || !amounts.supplierCost || !deliveryTime) {
      toast.error("Supplier, supplier cost, and delivery time are required");
      return;
    }

    setSaving(true);
    try {
      const data = await apiFetch("/quotations", {
        method: "POST",
        body: JSON.stringify({
          requestId, supplierName, supplierEmail, currency, ...amounts,
          deliveryTime, validityDays: Number(validityDays), terms, notes, status, sourceRfqId: sourceRfqId || undefined,
        }),
      });
      toast.success(status === "Sent" ? "Quotation saved and marked ready" : "Draft quotation saved");
      downloadQuotationPdf(data.quotation as PdfQuotation, request);
      setTimeout(() => { window.location.href = `/requests/${requestId}`; }, 900);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create quotation");
    } finally {
      setSaving(false);
    }
  }

  const moneyInput = (label: string, field: MoneyField, confidential = false) => (
    <label className="block">
      <span className="mb-2 flex items-center justify-between font-semibold">
        {label}{confidential && <small className="rounded bg-red-50 px-2 py-1 text-red-700">Private</small>}
      </span>
      <input type="number" min="0" step="0.01" required={field === "supplierCost"}
        className="w-full rounded-xl border border-gray-300 p-3" value={amounts[field]}
        onChange={(event) => setMoney(field, event.target.value)} />
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="font-semibold text-yellow-600">AFRILINK ADMIN</p><h1 className="text-3xl font-bold text-blue-950 md:text-4xl">Create Official Quotation</h1>
            <p className="mt-2 text-gray-600">Supplier details and internal costs remain private.</p></div>
          <a href={`/requests/${requestId}`} className="rounded-lg bg-white px-4 py-2 shadow">Back to request</a>
        </div>

        {request && <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"><p className="text-sm font-semibold text-blue-700">BUYER REQUEST</p><h2 className="text-xl font-bold text-blue-950">{request.title}</h2><p>{request.customerName || "Legacy customer"} · {request.quantity || "Quantity not specified"} · {request.deliveryLocation || request.country}</p>{sourceLabel && <p className="mt-3 rounded-lg bg-green-100 p-3 font-semibold text-green-900">Selected confidential offer: {sourceLabel}. A 20% Afrilink markup has been prefilled for review.</p>}</div>}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-bold text-blue-950">1. Private supplier record</h2><div className="grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-2 block font-semibold">Supplier name</span><input required className="w-full rounded-xl border p-3" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} /></label>
              <label className="block"><span className="mb-2 block font-semibold">Supplier email</span><input type="email" className="w-full rounded-xl border p-3" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} /></label>
            </div></section>

            <section className="rounded-2xl bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold text-blue-950">2. Cost and margin</h2><select className="rounded-lg border p-2" value={currency} onChange={(e) => setCurrency(e.target.value as "ZMW" | "USD")}><option>ZMW</option><option>USD</option></select></div>
              <div className="grid gap-4 md:grid-cols-2">{moneyInput("Supplier cost", "supplierCost", true)}{moneyInput("Freight and logistics", "freightCost", true)}{moneyInput("Customs and clearance", "customsCost", true)}{moneyInput("Afrilink service fee", "serviceFee")}{moneyInput("Afrilink markup", "markupAmount", true)}</div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-bold text-blue-950">3. Commercial terms</h2><div className="grid gap-4 md:grid-cols-2">
              <label><span className="mb-2 block font-semibold">Estimated delivery</span><input required placeholder="Example: 45-60 days" className="w-full rounded-xl border p-3" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} /></label>
              <label><span className="mb-2 block font-semibold">Valid for (days)</span><input type="number" min="1" className="w-full rounded-xl border p-3" value={validityDays} onChange={(e) => setValidityDays(e.target.value)} /></label>
              <label className="md:col-span-2"><span className="mb-2 block font-semibold">Payment terms</span><input className="w-full rounded-xl border p-3" value={terms} onChange={(e) => setTerms(e.target.value)} /></label>
              <label className="md:col-span-2"><span className="mb-2 block font-semibold">Buyer-facing notes</span><textarea className="h-28 w-full rounded-xl border p-3" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
            </div></section>
          </div>

          <aside className="h-fit rounded-2xl bg-blue-950 p-6 text-white shadow-xl lg:sticky lg:top-6"><p className="text-sm font-bold text-yellow-400">LIVE QUOTATION SUMMARY</p><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><span>Internal landed cost</span><span>{currency} {baseCost.toLocaleString()}</span></div><div className="flex justify-between"><span>Gross profit</span><span>{currency} {grossProfit.toLocaleString()}</span></div><div className="flex justify-between"><span>Gross margin</span><span>{marginPercent.toFixed(1)}%</span></div></div><div className="my-6 border-t border-blue-700 pt-6"><p className="text-sm text-blue-200">Buyer total</p><p className="text-3xl font-bold text-yellow-400">{currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
            <label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">Save as</span><select className="w-full rounded-lg bg-white p-3 text-gray-900" value={status} onChange={(e) => setStatus(e.target.value as "Draft" | "Sent")}><option value="Draft">Internal draft</option><option value="Sent">Ready for buyer</option></select></label>
            <button disabled={saving} className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-bold text-blue-950 transition hover:bg-yellow-300 disabled:opacity-60">{saving ? "Creating..." : "Save & Download PDF"}</button><p className="mt-3 text-xs text-blue-200">The PDF hides supplier identity, supplier cost, and markup.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}
