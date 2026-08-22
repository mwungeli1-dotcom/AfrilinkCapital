"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: string;
  supplierPrice?: number;
  publicPrice?: number;
  markupPercent?: number;
  currency?: "USD" | "ZMW";
  delivery: string;
  origin: string;
  description?: string;
  image?: string;
  status?: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
  supplierId?: { name?: string; email?: string } | string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "supplier">("admin");

  async function fetchProducts() {
    try {
      const savedUser = localStorage.getItem("user");
      const currentRole = savedUser ? JSON.parse(savedUser).role : "";
      const data = await apiFetch(currentRole === "supplier" ? "/supplier/products" : "/admin/products");

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      toast.error("Please login first");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    const user = JSON.parse(savedUser);

    if (!["admin", "super_admin", "supplier"].includes(user.role)) {
      toast.error("Supplier or admin access required");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

      return;
    }

    // This synchronizes the catalogue view with the authenticated browser session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(user.role === "supplier" ? "supplier" : "admin");

    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    const confirmed = confirm("Are you sure you want to delete this product?");

    if (!confirmed) return;

    try {
      await apiFetch(`/products/${id}`, {
        method: "DELETE",
      });

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function reviewProduct(id: string, status: "Approved" | "Rejected") {
    let rejectionReason = "";
    if (status === "Rejected") {
      rejectionReason = prompt("Tell the supplier what must be corrected:") || "Needs revision";
    }
    try {
      await apiFetch(`/products/${id}/approval`, { method: "PUT", body: JSON.stringify({ status, rejectionReason }) });
      toast.success(`Product ${status.toLowerCase()}`);
      fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
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
            {role === "supplier" ? "My Product Catalogue" : "Admin Product Review"}
          </h1>

          <p className="text-gray-600 mt-2">
            {role === "supplier" ? "Submit products to Afrilink and track their approval." : "Review supplier submissions and manage showroom products."}
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="bg-blue-900 text-white px-5 py-3 rounded-xl text-center"
        >
          {role === "supplier" ? "Submit New Product" : "Add New Product"}
        </Link>
      </div>

      {products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h2 className="text-2xl font-bold text-blue-900">
            No Products Found
          </h2>

          <p className="text-gray-600 mt-2">
            {role === "supplier" ? "Submit your first product for Afrilink review." : "Create your first product for the Afrilink Hub showroom."}
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
                  // Supplier images use externally hosted URLs that are not known at build time.
                  // eslint-disable-next-line @next/next/no-img-element
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

                {product.supplierPrice !== undefined ? (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600">Supplier price: {product.currency} {product.supplierPrice.toLocaleString()}</p>
                    <p className="text-blue-700">Afrilink commission ({product.markupPercent || 20}%): {product.currency} {((product.publicPrice || 0) - product.supplierPrice).toLocaleString()}</p>
                    <p className="font-bold text-green-700">Buyer price: {product.currency} {(product.publicPrice || 0).toLocaleString()}</p>
                  </div>
                ) : <p className="text-gray-600">Buyer price: {product.price}</p>}

                <p className="text-gray-500 text-sm">
                  Origin: {product.origin}
                </p>

                <p className="text-gray-500 text-sm">
                  Delivery: {product.delivery}
                </p>

                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${product.status === "Approved" ? "bg-green-100 text-green-800" : product.status === "Rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {product.status || "Approved"}
                </span>
                {["admin", "super_admin"].includes(role) && typeof product.supplierId === "object" && (
                  <p className="mt-2 text-sm text-gray-600">Supplier: {product.supplierId?.name || product.supplierId?.email || "Afrilink"}</p>
                )}
                {product.rejectionReason && <p className="mt-2 text-sm text-red-700">Revision: {product.rejectionReason}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {["admin", "super_admin"].includes(role) && product.status !== "Approved" && (
                <button onClick={() => reviewProduct(product._id, "Approved")} className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">Approve</button>
              )}
              {["admin", "super_admin"].includes(role) && product.status !== "Rejected" && (
                <button onClick={() => reviewProduct(product._id, "Rejected")} className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">Request Revision</button>
              )}
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
