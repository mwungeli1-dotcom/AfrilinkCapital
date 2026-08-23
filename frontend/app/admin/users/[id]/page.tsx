"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type Financial = { currency: string; quoted: number; collected: number; balance: number };
type CustomerData = {
  user: { _id: string; name: string; email: string; role: string; supplierStatus?: string; phone?: string; country?: string; companyName?: string; avatar?: string; accountStatus: "active" | "suspended"; suspensionReason?: string; createdAt: string; updatedAt: string; online: boolean; currentPage?: string; lastSeen?: string };
  summary: { requestCount: number; quotationCount: number; productCount: number; savedProductCount: number; financials: Financial[] };
  requests: Array<{ _id: string; title?: string; quantity?: string; country?: string; deliveryLocation?: string; status: string; createdAt: string }>;
  quotations: Array<{ _id: string; quotationNumber: string; requestId: string; currency: string; totalAmount: number; amountPaid: number; status: string; paymentStatus: string; createdAt: string }>;
  products: Array<{ _id: string; name: string; category: string; publicPrice?: number; currency: string; status: string; isActive: boolean; views: number; requestCount: number; image?: string; images?: string[]; createdAt: string }>;
  supplierApplication?: { companyName: string; country: string; contactPerson: string; phone: string; website?: string; productCategories?: string[]; status: string; createdAt: string } | null;
};

const money = (value: number, currency: string) => new Intl.NumberFormat("en-ZM", { style: "currency", currency, maximumFractionDigits: 2 }).format(value || 0);
const date = (value: string) => new Date(value).toLocaleDateString("en-ZM", { day: "numeric", month: "short", year: "numeric" });
const badge = (status: string) => status.toLowerCase().includes("paid") && status !== "Unpaid" || ["active", "approved", "accepted"].includes(status.toLowerCase()) ? "bg-green-100 text-green-700" : ["suspended", "rejected", "unpaid"].includes(status.toLowerCase()) ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700";

export default function AdminCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadCustomer = useCallback(() => apiFetch(`/admin/users/${id}`).then(setData).catch((error) => toast.error(error instanceof Error ? error.message : "Failed to load customer")).finally(() => setLoading(false)), [id]);
  useEffect(() => { loadCustomer(); }, [loadCustomer]);

  async function changeStatus() {
    if (!data) return;
    const nextStatus = data.user.accountStatus === "suspended" ? "active" : "suspended";
    if (!window.confirm(`${nextStatus === "suspended" ? "Suspend" : "Reactivate"} ${data.user.name}'s account?`)) return;
    try {
      setUpdating(true);
      const response = await apiFetch(`/admin/users/${id}/status`, { method: "PUT", body: JSON.stringify({ status: nextStatus }) });
      toast.success(response.message);
      await loadCustomer();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Update failed"); }
    finally { setUpdating(false); }
  }

  if (loading) return <main className="min-h-screen bg-[#f4f4f4] p-10 text-center text-sm text-slate-500">Loading customer relationship...</main>;
  if (!data) return <main className="min-h-screen bg-[#f4f4f4] p-10 text-center"><p className="font-bold">Customer profile unavailable.</p><Link href="/admin/users" className="mt-4 inline-block text-sm font-bold text-orange-600">Back to users</Link></main>;
  const { user, summary, requests, quotations, products, supplierApplication } = data;

  return <main className="min-h-screen bg-[#f4f4f4] px-3 py-5 lg:px-5 lg:py-8"><div className="mx-auto max-w-[1400px]">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-slate-500"><Link href="/dashboard" className="hover:text-orange-600">My Afrilink</Link> › <Link href="/admin/users" className="hover:text-orange-600">Users</Link> › Customer 360°</p><h1 className="mt-1 text-3xl font-black">Customer 360°</h1></div><Link href="/admin/users" className="rounded-full border bg-white px-5 py-2 text-xs font-bold">← All users</Link></div>

    <section className="rounded-xl bg-blue-950 p-5 text-white shadow-sm lg:p-7"><div className="flex flex-wrap items-center justify-between gap-5"><div className="flex items-center gap-4">{user.avatar ? <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-black">{user.name?.charAt(0).toUpperCase()}</span>}<div><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-black">{user.name}</h2>{user.online && <span className="rounded-full bg-green-400/20 px-2 py-1 text-[10px] font-black text-green-300">● ONLINE NOW</span>}</div><p className="mt-1 text-sm text-blue-200">{user.companyName || "Afrilink customer"} · {user.role.replace("_", " ").toUpperCase()}</p><p className="mt-1 text-xs text-blue-300">Registered {date(user.createdAt)}{user.online && user.currentPage ? ` · Viewing ${user.currentPage}` : ""}</p></div></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase ${user.accountStatus === "active" ? "bg-green-400/20 text-green-300" : "bg-red-400/20 text-red-200"}`}>{user.accountStatus}</span><button type="button" onClick={changeStatus} disabled={updating || user.role === "super_admin"} className={`rounded-full px-4 py-2 text-xs font-black disabled:opacity-40 ${user.accountStatus === "suspended" ? "bg-green-600" : "bg-red-600"}`}>{updating ? "Updating..." : user.accountStatus === "suspended" ? "Reactivate" : "Suspend account"}</button></div></div>{user.suspensionReason && <p className="mt-4 rounded-lg bg-red-400/10 p-3 text-xs text-red-200">Suspension reason: {user.suspensionReason}</p>}</section>

    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["RFQs submitted", summary.requestCount], ["Quotations", summary.quotationCount], ["Saved products", summary.savedProductCount], ["Supplier listings", summary.productCount]].map(([label, value]) => <div key={label} className="rounded-lg border bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}</div>

    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]"><section className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="font-black">Contact & account</h3><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Email</dt><dd className="mt-1 break-all font-bold">{user.email}</dd></div><div><dt className="text-xs text-slate-500">Phone</dt><dd className="mt-1 font-bold">{user.phone || "Not provided"}</dd></div><div><dt className="text-xs text-slate-500">Country</dt><dd className="mt-1 font-bold">{user.country || "Not provided"}</dd></div><div><dt className="text-xs text-slate-500">Last account update</dt><dd className="mt-1 font-bold">{date(user.updatedAt)}</dd></div></dl>{supplierApplication && <div className="mt-5 border-t pt-4"><div className="flex justify-between"><h4 className="text-sm font-black">Supplier application</h4><span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${badge(supplierApplication.status)}`}>{supplierApplication.status}</span></div><p className="mt-2 text-xs text-slate-600">{supplierApplication.companyName} · {supplierApplication.country}</p><p className="mt-1 text-xs text-slate-500">Categories: {supplierApplication.productCategories?.join(", ") || "Not specified"}</p></div>}</section><section className="rounded-lg border bg-white p-5 shadow-sm"><h3 className="font-black">Commercial value</h3>{summary.financials.length ? <div className="mt-4 grid gap-3 sm:grid-cols-3">{summary.financials.map((item) => <div key={item.currency} className="contents"><div className="rounded-lg bg-slate-50 p-4"><p className="text-[10px] font-bold text-slate-500">QUOTED · {item.currency}</p><p className="mt-1 font-black">{money(item.quoted, item.currency)}</p></div><div className="rounded-lg bg-green-50 p-4"><p className="text-[10px] font-bold text-green-700">COLLECTED · {item.currency}</p><p className="mt-1 font-black text-green-800">{money(item.collected, item.currency)}</p></div><div className="rounded-lg bg-orange-50 p-4"><p className="text-[10px] font-bold text-orange-700">BALANCE · {item.currency}</p><p className="mt-1 font-black text-orange-800">{money(item.balance, item.currency)}</p></div></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No quotation value recorded yet.</p>}</section></div>

    <section className="mt-4 overflow-hidden rounded-lg border bg-white shadow-sm"><div className="border-b px-5 py-4"><h3 className="font-black">RFQ history</h3></div>{requests.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="px-5 py-3">Request</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Delivery</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y">{requests.map((request) => <tr key={request._id}><td className="px-5 py-3 font-bold">{request.title || "General sourcing request"}</td><td className="px-5 py-3">{request.quantity || "—"}</td><td className="px-5 py-3">{request.deliveryLocation || request.country || "—"}</td><td className="px-5 py-3">{date(request.createdAt)}</td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-black ${badge(request.status)}`}>{request.status}</span></td><td className="px-5 py-3 text-right"><Link href={`/requests/${request._id}`} className="font-black text-orange-600">Open</Link></td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-slate-500">This customer has not submitted an RFQ.</p>}</section>

    <div className="mt-4 grid gap-4 lg:grid-cols-2"><section className="overflow-hidden rounded-lg border bg-white shadow-sm"><div className="border-b px-5 py-4"><h3 className="font-black">Quotations & payments</h3></div>{quotations.length ? <div className="divide-y">{quotations.map((quote) => <div key={quote._id} className="flex items-center justify-between gap-3 p-4 text-xs"><div><p className="font-black">{quote.quotationNumber}</p><p className="mt-1 text-slate-500">{date(quote.createdAt)} · {quote.status}</p></div><div className="text-right"><p className="font-black">{money(quote.totalAmount, quote.currency)}</p><span className={`mt-1 inline-block rounded-full px-2 py-1 text-[9px] font-black ${badge(quote.paymentStatus)}`}>{quote.paymentStatus}</span></div></div>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No quotations issued yet.</p>}</section><section className="overflow-hidden rounded-lg border bg-white shadow-sm"><div className="border-b px-5 py-4"><h3 className="font-black">Supplier listings</h3></div>{products.length ? <div className="divide-y">{products.map((product) => <Link href={`/products/${product._id}`} key={product._id} className="flex items-center gap-3 p-4 hover:bg-slate-50"><img src={product.images?.[0] || product.image || "/placeholder.png"} alt="" className="h-12 w-12 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{product.name}</p><p className="mt-1 text-[10px] text-slate-500">{product.category} · {product.views || 0} views</p></div><div className="text-right text-xs"><p className="font-black">{product.publicPrice != null ? money(product.publicPrice, product.currency) : "Price on request"}</p><span className={`text-[9px] font-bold ${product.status === "Approved" ? "text-green-600" : "text-orange-600"}`}>{product.status}</span></div></Link>)}</div> : <p className="p-8 text-center text-sm text-slate-500">No supplier products listed.</p>}</section></div>
  </div></main>;
}
