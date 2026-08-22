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
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

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

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category.toLowerCase() === category.toLowerCase();
      const matchesSearch =
        !query ||
        [product.name, product.category, product.origin, product.description]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [category, products, search]);

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
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-900 mb-2">
        Product Showroom
      </h1>

      <p className="text-gray-600 mb-8">
        Browse products available through Afrilink Capital procurement.
      </p>

      {!error && products.length > 0 && (
        <div className="mb-8 grid gap-4 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[1fr_260px]">
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
            }}
            className="mt-5 rounded-xl border border-blue-950 px-5 py-2 font-semibold text-blue-950"
          >
            Clear filters
          </button>
        </div>
      )}

      {!error && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow p-5">
            <div className="relative h-40 bg-gray-200 rounded mb-4 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <Image
                  unoptimized
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  src={product.image}
                  alt={product.name}
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-500">Product Image</span>
              )}
            </div>

            <p className="text-sm text-blue-700 font-semibold">
              {product.category}
            </p>

            <h2 className="text-lg font-bold mt-2 mb-2">
              {product.name}
            </h2>

            <p className="text-gray-700">{product.price}</p>

            <p className="text-gray-500 text-sm">
              Delivery: {product.delivery}
            </p>

            <p className="text-gray-500 text-sm">
              Origin: {product.origin}
            </p>

            <p className="text-xs text-gray-500 mt-3">
              Afrilink Capital manages sourcing, negotiation, importation and
              delivery.
            </p>

            <Link
              href={`/products/${product._id}`}
              className="block text-center mt-4 bg-blue-900 text-white py-2 rounded hover:bg-yellow-400 hover:text-black transition"
            >
              View Product
            </Link>
          </div>
        ))}
      </div>}
    </main>
  );
}
