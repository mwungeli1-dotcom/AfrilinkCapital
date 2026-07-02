"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      toast.error("Admin login required");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);

      return;
    }

    const user = JSON.parse(savedUser);

    if (user.role !== "admin") {
      toast.error("Admin access required");

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

      return;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const data = await apiFetch(`/products/${id}`);
        const product = data.product || data;

        setName(product.name || "");
        setCategory(product.category || "");
        setPrice(product.price || "");
        setDelivery(product.delivery || "");
        setOrigin(product.origin || "");
        setDescription(product.description || "");
        setImage(product.image || "");
        setVideo(product.video || "");
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  async function uploadImage(file: File) {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Big boss: change "afrilink" if your Cloudinary upload preset has a different name
      formData.append("upload_preset", "afrilink_uploads");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsqmjywoxi/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Image upload failed");
      }

      setImage(data.secure_url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

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

      await apiFetch(`/products/${id}`, {
        method: "PUT",
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

      toast.success("Product updated successfully!");

      setTimeout(() => {
        window.location.href = "/admin/products";
      }, 800);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
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

          <div className="space-y-3 border rounded-xl p-4">
            <label className="block font-semibold text-gray-700">
              Product Image
            </label>

            <input
              className="w-full border p-3 rounded-lg"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              className="w-full border p-3 rounded-lg bg-gray-50"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                uploadImage(file);
              }}
            />

            {uploading && (
              <p className="text-blue-700 font-semibold">
                Uploading image...
              </p>
            )}

            {image && (
              <div className="border rounded-xl p-4 bg-gray-50">
                <p className="font-semibold mb-2">Image Preview</p>
                <img
                  src={image}
                  alt="Product preview"
                  className="w-full max-h-64 object-contain rounded-xl"
                />
              </div>
            )}
          </div>

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Video URL"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
          />

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
            disabled={saving || uploading}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            {saving
              ? "Saving Product..."
              : uploading
              ? "Uploading Image..."
              : "Save Product"}
          </button>
        </form>
      </div>
    </main>
  );
}