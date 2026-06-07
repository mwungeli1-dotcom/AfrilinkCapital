"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const [id, setId] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const parts = window.location.pathname.split("/");
    setId(parts[3]);
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`http://afrilinkcapital.onrender.com/products/${id}`);
        const data = await res.json();

        const product = data.product || data;

        setName(product.name || "");
        setCategory(product.category || "");
        setPrice(product.price || "");
        setDelivery(product.delivery || "");
        setOrigin(product.origin || "");
        setDescription(product.description || "");
        setImage(product.image || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product");
      }
    }

    fetchProduct();
  }, [id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!id) {
      toast.error("Product ID missing");
      return;
    }

    const res = await fetch(`http://afrilinkcapital.onrender.com/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        category,
        price,
        delivery,
        origin,
        description,
        image,
      }),
    });

    const data = await res.json();

    if (data.success || res.ok) {
      toast.success("Product updated successfully!");
      window.location.href = "/admin/products";
    } else {
      toast.error(data.message || "Failed to update product");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => (window.location.href = "/admin/products")}
          className="mb-6 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>

        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Edit Product
        </h1>

        <p className="text-gray-600 mb-6">
          Update Afrilink Hub showroom product details.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input className="w-full border p-3 rounded-lg" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />

          <input className="w-full border p-3 rounded-lg" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />

          <input className="w-full border p-3 rounded-lg" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />

          <input className="w-full border p-3 rounded-lg" placeholder="Delivery Time" value={delivery} onChange={(e) => setDelivery(e.target.value)} />

          <input className="w-full border p-3 rounded-lg" placeholder="Origin Country" value={origin} onChange={(e) => setOrigin(e.target.value)} />

          <input className="w-full border p-3 rounded-lg" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />

          <textarea className="w-full border p-3 rounded-lg h-36" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg">
            Save Product
          </button>
        </form>
      </div>
    </main>
  );
}