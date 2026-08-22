"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/src/lib/api";
import BuyerOnly from "@/components/BuyerOnly";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: string;
  delivery: string;
  origin: string;
  description?: string;
  image?: string;
  publicPrice?: number;
  currency?: "USD" | "ZMW";
  views?: number;
  requestCount?: number;
  createdAt?: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams(window.location.search);
        setSearch(params.get("search") || "");
        setCategory(params.get("category") || "all");
        const data = await apiFetch("/products");
        setProducts(data.products || []);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category.trim()).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const origins = useMemo(() => Array.from(new Set(products.map((product) => product.origin?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)), [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matches = products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        !query ||
        [product.name, product.category, product.origin, product.description]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));

      const matchesOrigin = origin === "all" || product.origin.toLowerCase() === origin.toLowerCase();
      return matchesCategory && matchesSearch && matchesOrigin;
    });

    return matches.sort((a, b) => {
      if (sort === "popular") return ((b.requestCount || 0) * 10 + (b.views || 0)) - ((a.requestCount || 0) * 10 + (a.views || 0));
      if (sort === "price-low") return (a.publicPrice || Number.MAX_SAFE_INTEGER) - (b.publicPrice || Number.MAX_SAFE_INTEGER);
      if (sort === "price-high") return (b.publicPrice || 0) - (a.publicPrice || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [category, origin, products, search, sort]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-10 w-72 animate-pulse rounded bg-gray-300" />
          <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Loading products">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-96 animate-pulse rounded-xl bg-white shadow" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-600">Afrilink marketplace</p>
      <h1 className="mt-1 text-3xl font-black text-blue-950 md:text-4xl">Products for African businesses</h1>
      <p className="mb-8 mt-2 text-slate-600">Search approved products and request one official quotation through Afrilink.</p>

      {!error && products.length > 0 && (
        <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px_190px] md:p-5">
          <div>
            <label htmlFor="product-search" className="mb-2 block text-sm font-semibold text-blue-950">
              Search the showroom
            </label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search machines, equipment or categories"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-2 block text-sm font-semibold text-blue-950">
              Category
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div><label htmlFor="product-origin" className="mb-2 block text-sm font-semibold text-blue-950">Origin</label><select id="product-origin" value={origin} onChange={(event) => setOrigin(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"><option value="all">All origins</option>{origins.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label htmlFor="product-sort" className="mb-2 block text-sm font-semibold text-blue-950">Sort by</label><select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"><option value="newest">Newest</option><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
        </div>
      )}

      {error ? (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            The showroom is temporarily unavailable
          </h2>
          <p className="text-gray-600 mt-2">
            Please try again shortly or tell us what you need and we will source it for you.
          </p>
          <BuyerOnly><Link href="/post-request" className="inline-block mt-5 bg-blue-950 text-white px-6 py-3 rounded-xl">
            Request a Quotation
          </Link></BuyerOnly>
        </div>
      ) : products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            Tell us what your business needs
          </h2>
          <p className="text-gray-600 mt-2">
            The catalogue is being updated. Afrilink Capital can source your product directly.
          </p>
          <BuyerOnly><Link href="/post-request" className="inline-block mt-5 bg-blue-950 text-white px-6 py-3 rounded-xl">
            Request a Quotation
          </Link></BuyerOnly>
        </div>
      )}

      {!error && products.length > 0 && filteredProducts.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-blue-900">No matching products</h2>
          <p className="mt-2 text-gray-600">
            Try another search or request the exact product you need.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setOrigin("all");
            }}
            className="mt-5 rounded-xl border border-blue-950 px-5 py-2 font-semibold text-blue-950"
          >
            Clear filters
          </button>
        </div>
      )}

      {!error && products.length > 0 && <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{filteredProducts.length} products found</p><BuyerOnly><Link href="/post-request" className="text-sm font-bold text-blue-800 hover:underline">Can&apos;t find it? Request sourcing →</Link></BuyerOnly></div>}

      {!error && <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <Link href={`/products/${product._id}`} key={product._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-yellow-400 hover:shadow-xl">
            <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <Image
                  unoptimized
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  src={product.image}
                  alt={product.name}
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-gray-500">Product Image</span>
              )}
              <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black text-green-700 shadow">✓ REVIEWED</span>
            </div>

            <div className="p-3 md:p-4"><p className="text-xs text-blue-700 font-semibold">
              {product.category}
            </p>

            <h2 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold leading-snug md:text-base">
              {product.name}
            </h2>

            <p className="mt-2 text-lg font-black text-blue-950 md:text-xl">{product.price || "Request price"}</p>
            <p className="mt-1 text-xs text-slate-500">{product.origin || "Global supply"} • {product.delivery || "Delivery quoted"}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>{product.views || 0} views</span><span className="font-bold text-blue-800">View details →</span></div></div>
          </Link>
        ))}
      </div>}
      </div>
    </main>
  );
}
