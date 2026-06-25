"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "@/src/lib/api";

type SupplierApplication = {
  _id: string;
  companyName: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
};

export default function SupplierApplicationsPage() {
  const [applications, setApplications] = useState<SupplierApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const data = await apiFetch("/supplier-applications");
      setApplications(data.applications || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load supplier applications");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <h1>Loading...</h1>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Supplier Applications
      </h1>

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold text-xl">{app.companyName}</h2>

              <p>{app.country}</p>

              <p>{app.contactPerson}</p>

              <p>{app.email}</p>

              <p>
                <strong>Status:</strong> {app.status || "Pending"}
              </p>
            </div>

            <Link
              href={`/admin/suppliers/${app._id}`}
              className="bg-blue-900 text-white px-5 py-2 rounded-lg"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}