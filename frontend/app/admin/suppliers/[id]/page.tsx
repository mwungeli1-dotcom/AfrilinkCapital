"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type SupplierApplication = {
  _id: string;
  companyName: string;
  country: string;
  contactPerson: string;
  phone: string;
  website?: string;
  businessRegistration?: string;
  productCategories?: string[];
  description?: string;
  status: string;
  userId?: {
    name: string;
    email: string;
    role: string;
  };
};

export default function SupplierReviewPage() {
  const params = useParams();
  const id = params.id as string;

  const [application, setApplication] =
    useState<SupplierApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      const data = await apiFetch(`/supplier-applications/${id}`);
      setApplication(data.application);
    } catch (error: any) {
      toast.error(error.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  }

  async function approveApplication() {
    try {
      setActionLoading(true);
      await apiFetch(`/supplier-applications/${id}/approve`, {
        method: "PUT",
      });

      toast.success("Supplier approved successfully");
      loadApplication();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve supplier");
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectApplication() {
    try {
      setActionLoading(true);
      await apiFetch(`/supplier-applications/${id}/reject`, {
        method: "PUT",
      });

      toast.success("Supplier application rejected");
      loadApplication();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject supplier");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <main className="p-8">Loading application...</main>;
  }

  if (!application) {
    return <main className="p-8">Application not found.</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <Link href="/admin/suppliers" className="text-blue-900 font-semibold">
          ← Back to Supplier Applications
        </Link>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-900">
              {application.companyName}
            </h1>

            <p className="text-gray-600 mt-2">
              Supplier application review
            </p>
          </div>

          <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-full font-semibold">
            {application.status || "Pending"}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-50 p-5 rounded-xl">
            <h2 className="font-bold text-xl mb-4">Company Details</h2>

            <p><strong>Company:</strong> {application.companyName}</p>
            <p><strong>Country:</strong> {application.country}</p>
            <p><strong>Contact Person:</strong> {application.contactPerson}</p>
            <p><strong>Phone:</strong> {application.phone}</p>
            <p><strong>Website:</strong> {application.website || "N/A"}</p>
            <p>
              <strong>Business Registration:</strong>{" "}
              {application.businessRegistration || "N/A"}
            </p>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl">
            <h2 className="font-bold text-xl mb-4">User Account</h2>

            <p><strong>Name:</strong> {application.userId?.name || "N/A"}</p>
            <p><strong>Email:</strong> {application.userId?.email || "N/A"}</p>
            <p><strong>Current Role:</strong> {application.userId?.role || "N/A"}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl mt-6">
          <h2 className="font-bold text-xl mb-4">Product Categories</h2>

          <p>
            {application.productCategories?.length
              ? application.productCategories.join(", ")
              : "N/A"}
          </p>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl mt-6">
          <h2 className="font-bold text-xl mb-4">Company Description</h2>

          <p className="whitespace-pre-line">
            {application.description || "No description provided."}
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={approveApplication}
            disabled={actionLoading || application.status === "Approved"}
            className="bg-green-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            Approve Supplier
          </button>

          <button
            onClick={rejectApplication}
            disabled={actionLoading || application.status === "Rejected"}
            className="bg-red-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
          >
            Reject Application
          </button>
        </div>
      </div>
    </main>
  );
}