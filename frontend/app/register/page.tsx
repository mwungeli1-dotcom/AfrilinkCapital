"use client";

import { apiFetch } from "../../src/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"buyer" | "supplier">("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState("");
  const [productCategories, setProductCategories] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("type") === "supplier") {
      // This selects the supplier flow for direct supplier-registration links.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccountType("supplier");
    }
  }, []);

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          accountType, name, email, password,
          ...(accountType === "supplier" ? {
            companyName, country, contactPerson, phone, website,
            businessRegistration,
            productCategories: productCategories.split(",").map((item) => item.trim()).filter(Boolean),
            description,
          } : {}),
        }),
      });

      toast.success(accountType === "supplier" ? "Application submitted for Afrilink approval!" : "Account created successfully!");
      setTimeout(() => { window.location.href = "/login"; }, 1200);
      return data;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-300 p-3 focus:border-blue-700 focus:outline-none";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <p className="font-bold text-yellow-600">JOIN AFRILINK CAPITAL</p>
        <h1 className="mt-1 text-3xl font-bold text-blue-950">Create Your Account</h1>
        <p className="mt-2 text-gray-600">Buy through Afrilink or apply to become an approved supply partner.</p>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
          <button type="button" onClick={() => setAccountType("buyer")} className={`rounded-lg p-3 font-semibold ${accountType === "buyer" ? "bg-blue-950 text-white shadow" : "text-gray-600"}`}>Buyer</button>
          <button type="button" onClick={() => setAccountType("supplier")} className={`rounded-lg p-3 font-semibold ${accountType === "supplier" ? "bg-blue-950 text-white shadow" : "text-gray-600"}`}>Supplier</button>
        </div>

        {accountType === "supplier" && (
          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
            Supplier accounts require Afrilink approval. You can log in immediately, but product listing activates only after approval.
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-bold text-blue-950">Account details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className={inputClass} placeholder="Email address" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input className={`${inputClass} md:col-span-2`} placeholder="Password (minimum 6 characters)" type="password" minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </section>

          {accountType === "supplier" && (
            <section className="border-t pt-6">
              <h2 className="text-lg font-bold text-blue-950">Company application</h2>
              <p className="mb-4 text-sm text-gray-600">These details are reviewed privately by Afrilink and are not shown to buyers.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <input className={inputClass} placeholder="Registered company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                <input className={inputClass} placeholder="Country" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)} required />
                <input className={inputClass} placeholder="Contact person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                <input className={inputClass} placeholder="Phone / WhatsApp" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                <input className={inputClass} placeholder="Business registration number" value={businessRegistration} onChange={(e) => setBusinessRegistration(e.target.value)} required />
                <input className={inputClass} placeholder="Website (optional)" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <input className={`${inputClass} md:col-span-2`} placeholder="Product categories, separated by commas" value={productCategories} onChange={(e) => setProductCategories(e.target.value)} />
                <textarea className={`${inputClass} h-32 md:col-span-2`} placeholder="Describe your company, factory, products, export experience and quality standards" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
            </section>
          )}

          <button disabled={submitting} className="w-full rounded-xl bg-blue-950 p-4 font-bold text-white transition hover:bg-yellow-400 hover:text-blue-950 disabled:opacity-60">
            {submitting ? "Submitting..." : accountType === "supplier" ? "Create Account & Apply" : "Create Buyer Account"}
          </button>
        </form>
      </div>
    </main>
  );
}
