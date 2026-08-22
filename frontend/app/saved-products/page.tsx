"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SaveProductButton from "@/components/SaveProductButton";
import { apiFetch } from "@/src/lib/api";

type Product = { _id: string; name: string; category: string; price: string; origin: string; delivery: string; image?: string };
type SavedItem = { _id: string; productId: Product; createdAt: string };

export default function SavedProductsPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { window.location.href = "/login"; return; }
    apiFetch("/saved-products")
      .then((data) => setItems(data.savedProducts || []))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-slate-100 px-4 py-10 md:px-8"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-600">Your shortlist</p><h1 className="mt-1 text-3xl font-black text-blue-950 md:text-4xl">Saved Products</h1><p className="mt-2 text-slate-600">Keep products here while you compare options and prepare your request.</p></div><Link href="/products" className="rounded-xl bg-blue-950 px-5 py-3 text-center font-black text-white">Explore products</Link></div>
    {loading ? <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div> : items.length === 0 ? <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm"><div className="text-5xl">♡</div><h2 className="mt-4 text-2xl font-black text-blue-950">No saved products yet</h2><p className="mt-2 text-slate-600">Tap the heart on products you want to revisit.</p><Link href="/products" className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-3 font-black text-blue-950">Browse marketplace</Link></div> : <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">{items.map((item) => { const product = item.productId; return <article key={item._id} className="relative overflow-hidden rounded-2xl border bg-white shadow-sm"><Link href={`/products/${product._id}`}><div className="relative aspect-square bg-slate-100">{product.image ? <Image unoptimized fill sizes="(max-width: 768px) 50vw, 25vw" src={product.image} alt={product.name} className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-slate-300">▦</div>}</div><div className="p-3 md:p-4"><p className="text-xs font-bold text-blue-700">{product.category}</p><h2 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold md:text-base">{product.name}</h2><p className="mt-2 text-lg font-black text-blue-950">{product.price || "Request price"}</p><p className="mt-1 text-xs text-slate-500">{product.origin || "Global supply"}</p></div></Link><div className="absolute right-2 top-2"><SaveProductButton productId={product._id} initialSaved compact onChange={(saved) => { if (!saved) setItems((current) => current.filter((entry) => entry._id !== item._id)); }} /></div></article>; })}</div>}
  </div></main>;
}
