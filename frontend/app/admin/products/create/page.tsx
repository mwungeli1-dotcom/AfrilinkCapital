"use client";
import { apiFetch } from "@/src/lib/api";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [delivery, setDelivery] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !category || !price || !delivery || !origin) {
      toast.error("Please fill in all important fields");
      return;
    }

    try {
      setSaving(true);

      const data = await apiFetch("/products", {
  method: "POST",
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
});

if (data.success === false) {
  toast.error(data.message || "Failed to create product");
  return;
}

      toast.success("Product created successfully!");

      setName("");
      setCategory("");
      setPrice("");
      setDelivery("");
      setOrigin("");
      setDescription("");
      setImage("");
      setVideo("");

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

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <Link href="/admin/products" className="text-blue-900 font-semibold">
            ← Back to Products
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Add New Product
        </h1>

        <p className="text-gray-600 mb-8">
          Add products to Afrilink Hub showroom. Supplier details remain hidden
          from customers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Price e.g. From $2,500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Delivery e.g. 45–60 days"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Origin e.g. China"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Image URL e.g. https://example.com/product.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <input
            className="w-full border p-4 rounded-xl"
            placeholder="Video URL e.g. https://example.com/product-video.mp4"
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
            className="w-full border p-4 rounded-xl h-36"
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl disabled:bg-gray-400"
          >
            {saving ? "Saving Product..." : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}