"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import { PRODUCT_CATEGORIES } from "@/src/lib/productCategories";
import BuyerOnly from "@/components/BuyerOnly";
import SaveProductButton from "@/components/SaveProductButton";

type Product = { _id: string; name: string; category: string; price: string; delivery: string; origin: string; description?: string; image?: string; views?: number; requestCount?: number };

const categoryIcons = ["⚙", "▣", "⌁", "◆", "⌂", "◉", "▤", "✦", "☀", "♢", "⚒", "✚", "▦", "⬡", "◈", "⌘", "◌"];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    apiFetch("/products").then((data) => setProducts(data.products || [])).catch((fetchError) => { console.error(fetchError); setError(true); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    apiFetch("/saved-products").then((data) => setSavedIds((data.productIds || []).map(String))).catch(() => undefined);
  }, []);

  const categories = useMemo(() => {
    const live = new Set(products.map((product) => product.category).filter(Boolean));
    return [...PRODUCT_CATEGORIES].sort((a, b) => Number(live.has(b)) - Number(live.has(a)) || a.localeCompare(b));
  }, [products]);

  const featuredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const searchMatch = !query || [product.name, product.category, product.origin, product.description].filter(Boolean).some((value) => value?.toLowerCase().includes(query));
      return categoryMatch && searchMatch;
    }).slice(0, 18);
  }, [activeCategory, products, search]);

  const promoProducts = products.slice(0, 3);
  const updateSaved = (productId: string, saved: boolean) => setSavedIds((current) => saved ? [...new Set([...current, productId])] : current.filter((id) => id !== productId));
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); const query = search.trim(); window.location.href = query ? `/products?search=${encodeURIComponent(query)}` : "/products"; };

  return <main className="min-h-screen bg-[#f4f4f4] text-slate-950">
    <section className="border-t bg-[#fff8f4] px-4 pb-8 pt-6 lg:pb-10 lg:pt-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex items-center justify-center gap-5 overflow-x-auto text-sm font-black sm:text-base lg:gap-9 lg:text-lg"><span className="whitespace-nowrap">Smart Sourcing<sup className="ml-1 text-orange-500">AI</sup></span><span className="h-5 w-px bg-slate-300" /><span className="border-b-2 border-orange-500 pb-2 text-orange-600">Products</span><Link href="/register?type=supplier" className="whitespace-nowrap hover:text-orange-600">Manufacturers</Link><Link href="/products" className="whitespace-nowrap hover:text-orange-600">Worldwide</Link></div>
        <form onSubmit={submitSearch} className="mx-auto mt-5 flex max-w-4xl overflow-hidden rounded-2xl border-2 border-orange-500 bg-white p-1.5 shadow-lg"><span className="hidden items-center px-3 text-xl text-slate-400 sm:flex">⌕</span><input aria-label="Search Afrilink products" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search machines, equipment, products and suppliers" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none sm:text-base" /><button className="rounded-xl bg-orange-500 px-5 font-black text-white hover:bg-orange-600 sm:px-8">Search</button></form>
        <div className="mx-auto mt-2 flex max-w-4xl items-center gap-5 px-2 text-[11px] text-slate-600"><span>▣ Image search</span><span>Popular: Machinery · Water systems · Packaging</span></div>
      </div>
    </section>

    <section className="border-y bg-white"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 text-xs font-bold sm:flex-row sm:items-center sm:justify-between lg:px-5"><span>Welcome to AfrilinkCapital.com</span><div className="flex gap-3 overflow-x-auto sm:gap-6"><BuyerOnly><Link href="/post-request" className="whitespace-nowrap hover:text-orange-600">◉ Request for Quotation</Link></BuyerOnly><Link href="/products?sort=popular" className="whitespace-nowrap hover:text-orange-600">♕ Top Ranking</Link><Link href="/contact" className="whitespace-nowrap hover:text-orange-600">⚒ Fast sourcing support</Link></div></div></section>

    <section className="mx-auto max-w-[1440px] px-2 py-4 sm:px-4 lg:px-5">
      <div className="grid gap-3 lg:grid-cols-[245px_1fr]">
        <aside className="hidden h-[316px] overflow-hidden rounded-lg bg-white lg:block"><h2 className="border-b px-4 py-3 text-sm font-black">☆ Categories for you</h2><div className="h-[270px] overflow-y-auto px-2 py-1">{categories.map((category, index) => <button key={category} onClick={() => setActiveCategory(category)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-orange-50 hover:text-orange-600"><span className="w-5 text-center text-base">{categoryIcons[index % categoryIcons.length]}</span><span className="min-w-0 flex-1 truncate">{category}</span><span>›</span></button>)}</div></aside>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {promoProducts.map((product, index) => <Link href={`/products/${product._id}`} key={product._id} className="rounded-lg bg-white p-3 shadow-sm"><h2 className="truncate text-xs font-black">{index === 0 ? "Browsing highlights" : `Keep looking for ${product.category}`}</h2><div className="relative mt-3 aspect-[4/3] overflow-hidden rounded bg-slate-100">{product.image ? <Image unoptimized fill sizes="(max-width:1024px) 50vw, 20vw" src={product.image} alt={product.name} className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-slate-300">▦</div>}<span className="absolute bottom-1 left-1 rounded bg-white px-2 py-1 text-[10px] font-bold">{product.price || "Request price"}</span></div><p className="mt-2 line-clamp-1 text-xs text-slate-600">{product.name}</p></Link>)}
          {promoProducts.length < 3 && Array.from({ length: 3 - promoProducts.length }, (_, index) => <div key={index} className="animate-pulse rounded-lg bg-white p-3"><div className="h-4 w-2/3 rounded bg-slate-100" /><div className="mt-3 aspect-[4/3] rounded bg-slate-100" /></div>)}
          <div className="relative col-span-2 overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 via-orange-200 to-orange-500 p-5 lg:col-span-1"><p className="text-lg font-black text-orange-700">Fast-selling products</p><p className="mt-2 max-w-36 text-xs text-orange-950">Discover reviewed products for growing African businesses.</p><Link href="/products" className="absolute bottom-4 left-5 rounded-full bg-orange-600 px-5 py-2 text-xs font-black text-white">View more</Link><div className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full border-[26px] border-orange-300/70" /></div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-2 pb-8 sm:px-4 lg:px-5">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><button onClick={() => { setActiveCategory("All"); setSearch(""); }} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${activeCategory === "All" ? "border border-slate-950 bg-white" : "bg-slate-200"}`}>🔥 All products</button>{categories.slice(0, 7).map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${activeCategory === category ? "bg-orange-500 text-white" : "bg-slate-200"}`}>{category}</button>)}</div>
      {loading ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-lg bg-white" />)}</div> : error ? <div className="rounded-lg bg-white p-10 text-center"><h2 className="text-xl font-black">The marketplace is refreshing</h2><p className="mt-2 text-sm text-slate-500">Our sourcing team can still help you directly.</p><BuyerOnly><Link href="/post-request" className="mt-5 inline-block rounded-full bg-orange-500 px-6 py-3 text-sm font-black text-white">Request quotation</Link></BuyerOnly></div> : featuredProducts.length === 0 ? <div className="rounded-lg bg-white p-10 text-center"><h2 className="text-xl font-black">No matching products yet</h2><Link href="/post-request" className="mt-4 inline-block font-bold text-orange-600">Ask Afrilink to source it →</Link></div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{featuredProducts.map((product) => <article key={product._id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><Link href={`/products/${product._id}`}><div className="relative aspect-square overflow-hidden bg-slate-100">{product.image?.trim() ? <Image unoptimized fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw" src={product.image.trim()} alt={product.name} className="object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl text-slate-300">▦</div>}<span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[9px] shadow">⌕</span></div><div className="p-2.5"><p className="line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 text-slate-800 sm:text-xs">{product.name}</p><p className="mt-2 text-base font-black">{product.price || "Request price"}</p><p className="mt-1 text-[10px] text-slate-500">MOQ: Confirm quantity</p><p className="mt-1 text-[10px] font-bold text-blue-700">Verified · {product.origin || "Global"}</p></div></Link><div className="absolute right-2 top-2"><SaveProductButton productId={product._id} initialSaved={savedIds.includes(product._id)} compact onChange={(saved) => updateSaved(product._id, saved)} /></div></article>)}</div>}
      {!loading && featuredProducts.length > 0 && <div className="mt-6 text-center"><Link href="/products" className="inline-block rounded-full border border-slate-950 bg-white px-7 py-3 text-sm font-black hover:bg-slate-950 hover:text-white">View all products</Link></div>}
    </section>

    <section className="border-y bg-white"><div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">{[["✓", "Afrilink reviewed", "Products checked before publication"], ["1", "Official quotation", "One accountable procurement partner"], ["20%", "Transparent markup", "Consistent buyer-facing pricing"], ["A–Z", "Import coordination", "Sourcing through delivery support"]].map(([value, title, detail]) => <div key={title} className="p-5"><p className="text-xl font-black text-orange-500">{value}</p><h3 className="mt-1 text-sm font-black">{title}</h3><p className="mt-1 text-xs text-slate-500">{detail}</p></div>)}</div></section>
  </main>;
}
