"use client";

import { useState } from "react";
import { apiFetch } from "@/src/lib/api";
import toast from "react-hot-toast";

export default function BecomeSupplierPage() {
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState("");
  const [productCategories, setProductCategories] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiFetch("/supplier-applications", {
        method: "POST",
        body: JSON.stringify({
          companyName,
          country,
          contactPerson,
          phone,
          website,
          businessRegistration,
          productCategories: productCategories
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          description,
        }),
      });

      toast.success(
        "Application submitted successfully. We'll review it soon."
      );

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-2">
          Become a Supplier
        </h1>

        <p className="text-gray-600 mb-8">
          Complete this application and our team will review your business.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Website (optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Business Registration Number"
            value={businessRegistration}
            onChange={(e) => setBusinessRegistration(e.target.value)}
          />

          <input
            className="w-full border p-3 rounded-lg"
            placeholder="Product Categories (comma separated)"
            value={productCategories}
            onChange={(e) => setProductCategories(e.target.value)}
          />

          <textarea
            className="w-full border p-3 rounded-lg h-40"
            placeholder="Describe your company..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}