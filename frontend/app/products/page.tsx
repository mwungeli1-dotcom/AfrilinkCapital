"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("http://afrilinkcapital.onrender.com/products");
        const data = await res.json();

        setProducts(data.products || []);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <main className="p-8">Loading products...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-blue-900 mb-2">
        Product Showroom
      </h1>

      <p className="text-gray-600 mb-8">
        Browse products available through Afrilink Capital procurement.
      </p>

      {products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            No Products Found
          </h2>
          <p className="text-gray-600 mt-2">
            Add products from the admin product creation page.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow p-5">
            <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Product Image</span>
              )}
            </div>

            <p className="text-sm text-blue-700 font-semibold">
              {product.category}
            </p>

            <h2 className="text-lg font-bold mt-2 mb-2">{product.name}</h2>

            <p className="text-gray-700">{product.price}</p>
            <p className="text-gray-500 text-sm">
              Delivery: {product.delivery}
            </p>
            <p className="text-gray-500 text-sm">Origin: {product.origin}</p>

            <p className="text-xs text-gray-500 mt-3">
              Afrilink Capital manages sourcing, negotiation, importation and
              delivery.
            </p>

            <Link
              href={`/products/${product._id}`}
              className="block text-center mt-4 bg-blue-900 text-white py-2 rounded"
            >
              View Product
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}