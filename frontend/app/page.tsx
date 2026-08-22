"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import BuyerOnly from "@/components/BuyerOnly";

type Product = { _id: string; name: string; category: string; price: string; delivery: string; origin: string; description?: string; image?: string };

const fallbackCategories = ["Machinery", "Water systems", "Food processing", "Construction", "Solar & energy", "Packaging"];
const categoryIcons = ["⚙️", "💧", "🏭", "🏗️", "☀️", "📦", "🚜", "🧰"];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/products")
      .then((data) => setProducts(data.products || []))
      .catch((fetchError) => { console.error("Failed to fetch products:", fetchError); setError(true); })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const available = Array.from(new Set(products.map((product) => product.category?.trim()).filter(Boolean)));
    return available.length ? available.slice(0, 8) : fallbackCategories;
  }, [products]);

  const featuredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = query ? products.filter((product) => [product.name, product.category, product.origin, product.description].filter(Boolean).some((value) => value?.toLowerCase().includes(query))) : products;
    return matches.slice(0, 12);
  }, [products, search]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    window.location.href = query ? `/products?search=${encodeURIComponent(query)}` : "/products";
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <section className="bg-blue-950 px-4 pb-10 pt-8 text-white md:px-6 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-6 overflow-x-auto pb-4 text-sm font-bold text-blue-200 md:text-base">
            <span className="border-b-4 border-yellow-400 pb-3 text-white">Products</span>
            <Link href="/register?type=supplier" className="whitespace-nowrap pb-3 hover:text-white">Manufacturers</Link>
            <Link href="/post-request" className="whitespace-nowrap pb-3 hover:text-white">Sourcing support</Link>
            <Link href="/products" className="whitespace-nowrap pb-3 hover:text-white">Worldwide supply</Link>
          </div>
          <div className="mt-7 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">Africa&apos;s managed sourcing marketplace</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight md:text-6xl">Find products. We handle the supplier, import and delivery.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-100 md:text-lg">Search approved products or tell Afrilink exactly what your business needs. You receive one clear quotation and one accountable procurement partner.</p>
          </div>
          <form onSubmit={submitSearch} className="mt-8 flex max-w-5xl overflow-hidden rounded-2xl border-4 border-yellow-400 bg-white p-1 shadow-2xl">
            <span className="hidden items-center px-4 text-xl text-slate-500 sm:flex" aria-hidden="true">⌕</span>
            <input aria-label="Search Afrilink products" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="What product are you looking for?" className="min-w-0 flex-1 px-4 py-3 text-base text-slate-950 outline-none md:py-4 md:text-lg" />
            <button className="rounded-xl bg-yellow-400 px-5 py-3 font-black text-blue-950 transition hover:bg-yellow-300 md:px-8">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-blue-100 md:text-sm"><span>Popular:</span>{categories.slice(0, 4).map((category) => <button key={category} onClick={() => setSearch(category)} className="rounded-full border border-blue-700 px-3 py-1 hover:border-yellow-400 hover:text-yellow-400">{category}</button>)}</div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-4 max-w-7xl px-4 md:-mt-6 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link href="/products" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-5"><span className="text-3xl" aria-hidden="true">▦</span><h2 className="mt-3 font-black text-blue-950">Source by category</h2><p className="mt-1 hidden text-sm text-slate-500 sm:block">Explore approved products</p></Link>
          <BuyerOnly><Link href="/post-request" className="block h-full rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-5"><span className="text-3xl" aria-hidden="true">🎯</span><h2 className="mt-3 font-black text-blue-950">Request quotation</h2><p className="mt-1 hidden text-sm text-slate-500 sm:block">Tell us what you need</p></Link></BuyerOnly>
          <Link href="/register?type=supplier" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-5"><span className="text-3xl" aria-hidden="true">🏭</span><h2 className="mt-3 font-black text-blue-950">Join as supplier</h2><p className="mt-1 hidden text-sm text-slate-500 sm:block">Reach African buyers</p></Link>
          <Link href="/contact" className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-5"><span className="text-3xl" aria-hidden="true">🛡️</span><h2 className="mt-3 font-black text-blue-950">Talk to Afrilink</h2><p className="mt-1 hidden text-sm text-slate-500 sm:block">Get sourcing support</p></Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-600">Explore the marketplace</p><h2 className="mt-1 text-2xl font-black text-blue-950 md:text-3xl">Source by category</h2></div><Link href="/products" className="text-sm font-bold text-blue-800 hover:underline">View all →</Link></div>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-3 md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-visible">{categories.map((category, index) => <Link key={category} href={`/products?category=${encodeURIComponent(category)}`} className="min-w-32 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:border-yellow-400 hover:shadow-md"><span className="text-3xl" aria-hidden="true">{categoryIcons[index % categoryIcons.length]}</span><p className="mt-3 line-clamp-2 text-sm font-bold text-blue-950">{category}</p></Link>)}</div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-slate-200 md:grid-cols-4 md:divide-y-0">{[["✓", "Afrilink reviewed", "Products are approved before listing"], ["Upfront", "Clear marketplace pricing", "Buyer-facing prices are shown clearly"], ["1", "Accountable partner", "Afrilink manages the transaction"], ["A–Z", "Import support", "Sourcing through final delivery"]].map(([value, title, detail]) => <div key={title} className="p-5 md:p-7"><p className="text-2xl font-black text-yellow-500">{value}</p><h3 className="mt-1 font-black text-blue-950">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500 md:text-sm">{detail}</p></div>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-10 md:px-6 md:py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-600">Recommended for your business</p><h2 className="mt-1 text-2xl font-black text-blue-950 md:text-3xl">Featured products</h2></div><div className="flex gap-2 overflow-x-auto"><button onClick={() => setSearch("")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${!search ? "bg-blue-950 text-white" : "bg-white text-slate-700"}`}>All products</button>{categories.slice(0, 3).map((category) => <button key={category} onClick={() => setSearch(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${search === category ? "bg-blue-950 text-white" : "bg-white text-slate-700"}`}>{category}</button>)}</div></div>
        {loading ? <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div> : error ? <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm"><h3 className="text-2xl font-black text-blue-950">The marketplace is refreshing</h3><p className="mt-2 text-slate-600">Tell us what you need and our sourcing team will assist you directly.</p><BuyerOnly><Link href="/post-request" className="mt-5 inline-block rounded-xl bg-blue-950 px-5 py-3 font-bold text-white">Request quotation</Link></BuyerOnly></div> : featuredProducts.length === 0 ? <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm"><h3 className="text-2xl font-black text-blue-950">No matching product yet</h3><p className="mt-2 text-slate-600">Afrilink can source it privately from our supplier network.</p><BuyerOnly><Link href="/post-request" className="mt-5 inline-block rounded-xl bg-yellow-400 px-5 py-3 font-black text-blue-950">Source this product</Link></BuyerOnly></div> : <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">{featuredProducts.map((product) => <Link key={product._id} href={`/products/${product._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-xl"><div className="relative aspect-square overflow-hidden bg-slate-100">{product.image?.trim() ? <Image unoptimized fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" src={product.image.trim()} alt={product.name} className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl text-slate-300">▦</div>}<span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-black text-green-700 shadow">✓ AFRILINK REVIEWED</span></div><div className="p-3 md:p-4"><p className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-slate-900 md:text-base">{product.name}</p><p className="mt-2 text-lg font-black text-blue-950 md:text-xl">{product.price || "Request price"}</p><p className="mt-1 text-xs text-slate-500">Origin: {product.origin || "Global supply"}</p><div className="mt-3 flex flex-wrap gap-1"><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">Managed sourcing</span>{product.delivery && <span className="rounded bg-yellow-50 px-2 py-1 text-[10px] font-bold text-yellow-800">{product.delivery}</span>}</div></div></Link>)}</div>}
        {!loading && featuredProducts.length > 0 && <div className="mt-8 text-center"><Link href={search ? `/products?search=${encodeURIComponent(search)}` : "/products"} className="inline-block rounded-xl bg-blue-950 px-7 py-3 font-black text-white hover:bg-blue-900">Explore all products</Link></div>}
      </section>

      <section className="bg-blue-950 px-5 py-14 text-white md:py-20"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="font-bold uppercase tracking-[0.18em] text-yellow-400">How Afrilink works</p><h2 className="mt-3 text-3xl font-black md:text-5xl">Global sourcing made practical for African businesses.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{[["01", "Send your requirement", "Search the marketplace or describe the exact product, quantity and destination."], ["02", "Afrilink sources and quotes", "We compare confidential supplier offers and issue one official Afrilink quotation."], ["03", "Approve and track delivery", "Afrilink coordinates payment records, procurement, shipping, clearance and delivery."]].map(([number, title, detail]) => <div key={number} className="rounded-2xl border border-blue-800 bg-blue-900/50 p-6"><span className="text-3xl font-black text-yellow-400">{number}</span><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 leading-relaxed text-blue-100">{detail}</p></div>)}</div></div></section>
      <section className="bg-yellow-400 px-5 py-12 text-blue-950 md:py-16"><div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><p className="font-bold uppercase tracking-[0.15em]">Can&apos;t find it?</p><h2 className="mt-2 text-3xl font-black md:text-4xl">Tell us what you need. We&apos;ll source it.</h2></div><BuyerOnly><Link href="/post-request" className="inline-block rounded-xl bg-blue-950 px-7 py-4 text-center font-black text-white hover:bg-blue-900">Request a quotation</Link></BuyerOnly></div></section>
    </main>
  );
}
