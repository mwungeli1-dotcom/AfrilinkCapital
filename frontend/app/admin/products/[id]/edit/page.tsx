"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(
          `https://afrilinkcapital.onrender.com/products/${id}`
        );

        const data = await res.json();

        if (!res.ok || data.success === false) {
          toast.error(data.message || "Failed to load product");
          return;
        }

        const product = data.product || data;

        setName(product.name || "");
        setCategory(product.category || "");
        setPrice(product.price || "");
        setDelivery(product.delivery || "");
        setOrigin(product.origin || "");
        setDescription(product.description || "");
        setImage(product.image || "");
        setVideo(product.video || "");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
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

    if (!name || !category || !price || !delivery || !origin) {
      toast.error("Please fill in all important fields");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(
        `https://afrilinkcapital.onrender.com/products/${id}`,
        {
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
            video,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.error(data.message || "Failed to update product");
        return;
      }

      toast.success("Product updated successfully!");

      setTimeout(() => {
        window.location.href = "/admin/products";
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p>Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <Link href="/admin/products" className="text-blue-900 font-semibold">
            ← Back to Products
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Edit Product
        </h1>

        <p className="text-gray-600 mb-6">
          Update Afrilink Hub showroom product details.
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Delivery Time"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Origin Country"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Video URL"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />

          {image && (
            <div className="border rounded-xl p-4">
              <p className="font-semibold mb-2">Image Preview</p>
              <img
                src={image}
                alt="Product preview"
                className="w-full max-h-64 object-cover rounded-xl"
              />
            </div>
          )}

          {video && (
            <div className="border rounded-xl p-4">
              <p className="font-semibold mb-2">Video Preview</p>
              <video
                src={video}
                controls
                className="w-full max-h-72 rounded-xl"
              />
            </div>
          )}

          <textarea
            className="w-full border p-3 rounded-lg h-36"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            {saving ? "Saving Product..." : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}