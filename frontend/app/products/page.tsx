"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/src/lib/api";
import BuyerOnly from "@/components/BuyerOnly";
import SaveProductButton from "@/components/SaveProductButton";

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
  const [savedIds, setSavedIds] = useState<string[]>([]);

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

    if (localStorage.getItem("token")) {
      apiFetch("/saved-products")
        .then((data) => setSavedIds(data.productIds || []))
        .catch((error) => console.error("Could not load saved products", error));
    }
  }, []);

  const updateSaved = (productId: string, saved: boolean) => {
    setSavedIds((current) =>
      saved
        ? Array.from(new Set([...current, productId]))
        : current.filter((id) => id !== productId)
    );
  };

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
      <main className="min-h-screen bg-[#f4f4f4] p-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="h-8 w-72 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" aria-label="Loading products">
            {Array.from({ length: 12 }, (_, item) => (
              <div key={item} className="h-72 animate-pulse rounded-lg bg-white shadow-sm" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-2 py-5 sm:px-4 lg:px-5">
      <div className="mx-auto max-w-[1440px]">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-slate-500"><Link href="/" className="hover:text-orange-600">Home</Link> / Product marketplace</p><h1 className="mt-1 text-2xl font-black text-slate-950">Products for African businesses</h1><p className="mt-1 text-xs text-slate-500">Afrilink-reviewed products with managed sourcing and official quotations.</p></div><BuyerOnly><Link href="/post-request" className="rounded-full bg-orange-500 px-5 py-2.5 text-xs font-black text-white hover:bg-orange-600">Request for Quotation</Link></BuyerOnly></div>

      {!error && products.length > 0 && (
        <div className="mb-4 grid gap-2 rounded-lg border bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_180px_190px]">
          <div>
            <label htmlFor="product-search" className="mb-1 block text-[11px] font-bold text-slate-600">Search products</label>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search machines, equipment or categories"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-1 block text-[11px] font-bold text-slate-600">Category</label>
            <select
              id="product-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div><label htmlFor="product-origin" className="mb-1 block text-[11px] font-bold text-slate-600">Ship from</label><select id="product-origin" value={origin} onChange={(event) => setOrigin(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"><option value="all">All origins</option>{origins.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div><label htmlFor="product-sort" className="mb-1 block text-[11px] font-bold text-slate-600">Sort by</label><select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"><option value="newest">Newest</option><option value="popular">Most popular</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></div>
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

      {!error && products.length > 0 && <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2"><p className="text-xs font-semibold text-slate-600"><strong className="text-slate-950">{filteredProducts.length}</strong> products found</p><span className="text-[10px] font-bold text-blue-700">✓ AFRILINK REVIEWED CATALOGUE</span></div>}

      {!error && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {filteredProducts.map((product) => (
          <article key={product._id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
          <Link href={`/products/${product._id}`}>
            <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <Image
                  unoptimized
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  src={product.image}
                  alt={product.name}
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-gray-500">Product Image</span>
              )}
              <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-1 text-[9px] shadow">⌕</span>
            </div>

            <div className="p-2.5"><p className="truncate text-[10px] font-bold text-blue-700">{product.category}</p>
            <h2 className="mt-1 line-clamp-2 min-h-8 text-[11px] font-semibold leading-4 text-slate-800 sm:text-xs">
              {product.name}
            </h2>
            <p className="mt-2 text-base font-black text-slate-950">{product.price || "Request price"}</p>
            <p className="mt-1 text-[10px] text-slate-500">MOQ: Confirm quantity</p>
            <p className="mt-1 text-[10px] font-bold text-blue-700">Verified · {product.origin || "Global supply"}</p>
            <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400"><span>{product.views || 0} views</span><span>{product.delivery || "Delivery quoted"}</span></div></div>
          </Link>
          <div className="absolute right-2 top-2">
            <SaveProductButton
              productId={product._id}
              initialSaved={savedIds.includes(product._id)}
              compact
              onChange={(saved) => updateSaved(product._id, saved)}
            />
          </div>
          </article>
        ))}
      </div>}
      </div>
    </main>
  );
}
