"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch("https://afrilinkcapital.onrender.com/products");
      const data = await res.json();

      setProducts(data.products || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Failed to load products");
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin login required");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = confirm("Are you sure you want to delete this product?");

    if (!confirmed) return;

    try {
      const res = await fetch(`https://afrilinkcapital.onrender.com/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.error(data.message || "Failed to delete product");
        return;
      }

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  }

  if (loading) {
    return <main className="p-8">Loading products...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">
            Admin Product Management
          </h1>

          <p className="text-gray-600 mt-2">
            Manage Afrilink Hub showroom products.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="bg-blue-900 text-white px-5 py-3 rounded-xl text-center"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            No Products Found
          </h2>

          <p className="text-gray-600 mt-2">
            Create your first product for the Afrilink Hub showroom.
          </p>
        </div>
      )}

      <div className="grid gap-5">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white p-5 rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-5"
          >
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xs text-center">
                    No Image
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  {product.name}
                </h2>

                <p className="text-sm text-blue-700 font-semibold">
                  {product.category}
                </p>

                <p className="text-gray-600">{product.price}</p>
                <p className="text-gray-500 text-sm">
                  Origin: {product.origin}
                </p>
                <p className="text-gray-500 text-sm">
                  Delivery: {product.delivery}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products/${product._id}`}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
              >
                View
              </Link>

              <Link
                href={`/admin/products/${product._id}/edit`}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </Link>

              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}