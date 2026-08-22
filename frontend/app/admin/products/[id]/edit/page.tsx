"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { PRODUCT_CATEGORIES } from "@/src/lib/productCategories";
import { apiFetch } from "@/src/lib/api";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [supplierPrice, setSupplierPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "ZMW">("USD");
  const [delivery, setDelivery] = useState("");
  const [origin, setOrigin] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const data = await apiFetch(`/manage/products/${id}`);
        const product = data.product || data;

        setName(product.name || "");
        setCategory(product.category || "");
        const legacyPublicPrice = Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0;
        setSupplierPrice(String(product.supplierPrice || (product.publicPrice ? product.publicPrice / 1.2 : legacyPublicPrice / 1.2) || ""));
        setCurrency(product.currency === "ZMW" ? "ZMW" : "USD");
        setDelivery(product.delivery || "");
        setOrigin(product.origin || "");
        setDescription(product.description || "");
        setImages(product.images?.length ? product.images.slice(0, 4) : product.image ? [product.image] : []);
        setVideo(product.video || "");
      } catch (error: unknown) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  async function uploadImages(files: File[]) {
    const remainingSlots = 4 - images.length;
    if (remainingSlots <= 0) return toast.error("A product can have up to 4 pictures");
    const selectedFiles = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) toast.error(`Only ${remainingSlots} more picture${remainingSlots === 1 ? "" : "s"} allowed`);
    try {
      setUploading(true);
      const uploaded = await Promise.all(selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "afrilink_uploads");
        const res = await fetch("https://api.cloudinary.com/v1_1/dsqmjywox/image/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok || !data.secure_url) throw new Error(data.error?.message || "Image upload failed");
        return data.secure_url as string;
      }));
      setImages((current) => [...current, ...uploaded].slice(0, 4));
      toast.success(`${uploaded.length} picture${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (error: unknown) {
  console.error(error);

  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("Failed to upload image");
  }
}finally {
      setUploading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!id) {
      toast.error("Product ID missing");
      return;
    }

    if (!name || !category || !supplierPrice || Number(supplierPrice) <= 0 || !delivery || !origin || !description) {
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
          supplierPrice: Number(supplierPrice),
          currency,
          delivery,
          origin,
          description,
          image: images[0] || "",
          images,
          video,
        }),
      });

      toast.success("Product updated successfully!");

      setTimeout(() => {
        window.location.href = "/admin/products";
      }, 800);
    } catch (error: unknown) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
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

          <select
            className="w-full border bg-white p-3 rounded-lg"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>Select a product category</option>
            {!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) && category && <option value={category} disabled>{category} (legacy category)</option>}
            {PRODUCT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 font-semibold text-blue-950">Pricing</p>
            <div className="grid gap-3 md:grid-cols-[140px_1fr]">
              <select className="rounded-lg border bg-white p-3" value={currency} onChange={(e) => setCurrency(e.target.value as "USD" | "ZMW")}><option value="USD">USD</option><option value="ZMW">ZMW</option></select>
              <input type="number" min="0.01" step="0.01" required className="w-full rounded-lg border bg-white p-3" placeholder="Supplier / factory price" value={supplierPrice} onChange={(e) => setSupplierPrice(e.target.value)} />
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
              <p>Supplier price: <strong>{currency} {(Number(supplierPrice) || 0).toLocaleString()}</strong></p>
              <p>Commission (20%): <strong>{currency} {((Number(supplierPrice) || 0) * 0.2).toLocaleString()}</strong></p>
              <p>Buyer price: <strong className="text-green-700">{currency} {((Number(supplierPrice) || 0) * 1.2).toLocaleString()}</strong></p>
            </div>
          </div>

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
              Product Pictures ({images.length}/4)
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading || images.length >= 4}
              className="w-full border p-3 rounded-lg bg-gray-50"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                uploadImages(files);
              }}
            />

            {uploading && (
              <p className="text-blue-700 font-semibold">
                Uploading pictures...
              </p>
            )}

            <p className="text-sm text-gray-600">The first picture is the main catalogue image.</p>
            {images.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((url, index) => <div key={url} className="relative overflow-hidden rounded-xl border bg-gray-50"><img src={url} alt={`Product preview ${index + 1}`} className="aspect-square w-full object-cover" /><button type="button" onClick={() => setImages((current) => current.filter((item) => item !== url))} className="absolute right-1 top-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove picture ${index + 1}`}>×</button>{index === 0 && <span className="absolute bottom-1 left-1 rounded bg-blue-950 px-2 py-1 text-[10px] font-bold text-white">Main</span>}</div>)}</div>}
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
