"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type Props = { productId: string; initialSaved?: boolean; compact?: boolean; onChange?: (saved: boolean) => void };

export default function SaveProductButton({ productId, initialSaved, compact = false, onChange }: Props) {
  const [internalSaved, setInternalSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const saved = initialSaved === undefined ? internalSaved : initialSaved;

  useEffect(() => {
    if (initialSaved !== undefined) return;
    if (!localStorage.getItem("token")) return;
    apiFetch(`/saved-products/${productId}/status`)
      .then((data) => setInternalSaved(Boolean(data.saved)))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [initialSaved, productId]);

  const toggle = async () => {
    if (!localStorage.getItem("token")) {
      toast.error("Log in to save products");
      setTimeout(() => { window.location.href = "/login"; }, 700);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch(`/saved-products/${productId}`, { method: "PUT" });
      if (initialSaved === undefined) setInternalSaved(data.saved);
      onChange?.(data.saved);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save product");
    } finally { setLoading(false); }
  };

  return <button type="button" disabled={loading} onClick={toggle} aria-label={saved ? "Remove from saved products" : "Save product"} className={compact ? `flex h-10 w-10 items-center justify-center rounded-full border bg-white text-xl shadow transition hover:scale-105 disabled:opacity-60 ${saved ? "border-red-200 text-red-600" : "border-slate-200 text-slate-600"}` : `rounded-xl border px-5 py-4 text-center font-black transition disabled:opacity-60 ${saved ? "border-red-200 bg-red-50 text-red-700" : "border-blue-950 text-blue-950 hover:bg-blue-50"}`}>{compact ? (saved ? "♥" : "♡") : (saved ? "♥ Saved product" : "♡ Save for later")}</button>;
}
