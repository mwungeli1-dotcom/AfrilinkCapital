"use client";
import { apiFetch } from "../../src/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type RequestItem = {
  customerName: string;
  phone: string;
  email: string;
  deliveryLocation: string;
  title: string;
  description: string;
  quantity: string;
  country: string;
};

export default function PostRequestPage() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [country, setCountry] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [supplierBlocked, setSupplierBlocked] = useState(false);
  const [productId, setProductId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const currentUser = JSON.parse(savedUser);
        if (currentUser?.role === "supplier") {
          // This blocks supplier accounts from entering the buyer quotation flow.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSupplierBlocked(true);
          toast.error("Supplier accounts cannot submit buyer quotation requests");
          setTimeout(() => { window.location.href = "/dashboard"; }, 900);
          return;
        }
        setCustomerName(currentUser?.name || "");
        setEmail(currentUser?.email || "");
        setPhone(currentUser?.phone || "");
        setCountry(currentUser?.country || "");
      } catch {
        // Ignore malformed local account data and continue as a visitor.
      }
    }
    const params = new URLSearchParams(window.location.search);
    const productName = params.get("product");
    setProductId(params.get("productId") || "");

    if (productName) {
      // This effect synchronizes the form with a product selected on another page.
      setTitle(productName);
      setDescription(
        `I am interested in importing ${productName} through Afrilink Capital.`
      );
    }
  }, []);

  if (supplierBlocked) {
    return <main className="min-h-screen bg-gray-100 p-8 text-center text-blue-950">Returning to your supplier dashboard...</main>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (
    !customerName ||
    !phone ||
    !deliveryLocation ||
    !title ||
    !description ||
    !quantity ||
    !country
  ) {
    toast.error("Please fill in all fields");
    return;
  }

  const newRequest = {
    customerName,
    phone,
    email,
    deliveryLocation,
    title,
    description,
    quantity,
    country,
    productId: productId || undefined,
  };

  try {
    setSubmitting(true);
    const data = await apiFetch("/requests", {
      method: "POST",
      body: JSON.stringify(newRequest),
    });

    console.log(data);

    if (!data.success) {
      toast.error(data.message || "Failed to submit request");
      return;
    }

    setRequests([...requests, newRequest]);

    toast.success("Request submitted successfully!");

    setTitle("");
    setDescription("");
    setQuantity("");
    setCountry("");
    setCustomerName("");
    setPhone("");
    setEmail("");
    setDeliveryLocation("");

    const isLoggedIn = Boolean(localStorage.getItem("token"));
    setTimeout(() => { window.location.href = isLoggedIn ? "/my-requests" : "/"; }, 1000);
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
};
  return (
    <main className="min-h-screen bg-[#f4f4f4] px-3 py-5 lg:px-5 lg:py-8">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-xs text-slate-500"><Link href="/" className="hover:text-orange-600">Home</Link> › Request for Quotation</p>
        <div className="mt-3"><h1 className="text-3xl font-black text-slate-950 lg:text-4xl">Request for Quotation</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Send one requirement to Afrilink. We coordinate supplier sourcing, negotiation, shipping, customs and delivery communication.</p></div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {productId && <div className="rounded-lg border border-orange-200 bg-orange-50 p-4"><p className="text-[10px] font-black uppercase tracking-wider text-orange-600">Selected marketplace product</p><p className="mt-1 font-black text-slate-950">{title}</p><p className="mt-1 text-xs text-slate-500">This quotation will remain linked to the product you selected.</p></div>}
          <section className="rounded-lg bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">1</span><div><h2 className="text-lg font-black">Describe what you need</h2><p className="mt-1 text-xs text-slate-500">Clear specifications help us source and quote accurately.</p></div></div>
            <div className="mt-5">
            <label htmlFor="request-title" className="mb-1.5 block text-xs font-bold">Product name</label>
            <input type="text" id="request-title" name="title" required placeholder="Example: 500LPH RO Water Machine" className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="mt-4"><label htmlFor="request-description" className="mb-1.5 block text-xs font-bold">Specifications and requirements</label><textarea id="request-description" name="description" required placeholder="Include capacity, size, material, power requirements, preferred brand, certification or other important details..." className="h-40 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          </section>

          <section className="rounded-lg bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">2</span><div><h2 className="text-lg font-black">Quantity and destination</h2><p className="mt-1 text-xs text-slate-500">Used to calculate supplier pricing, freight and delivery options.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2">
            <div><label htmlFor="request-quantity" className="mb-1.5 block text-xs font-bold">Required quantity</label><input type="text" id="request-quantity" name="quantity" required placeholder="Example: 2 machines" className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-orange-500" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div><label htmlFor="request-country" className="mb-1.5 block text-xs font-bold">Delivery country</label><input type="text" id="request-country" name="country" autoComplete="country-name" required placeholder="Example: Zambia" className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-orange-500" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          </div></section>

          <section className="rounded-lg bg-white p-5 shadow-sm"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs font-black text-white">3</span><div><h2 className="text-lg font-black">Your contact details</h2><p className="mt-1 text-xs text-slate-500">Afrilink uses these details to clarify specifications and issue your quotation.</p></div></div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="customer-name" className="mb-1.5 block text-xs font-bold">Full name</label>
                <input
                  id="customer-name"
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="mb-1.5 block text-xs font-bold">Phone / WhatsApp</label>
                <input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Example: +260 777 777 079"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="customer-email" className="mb-1.5 block text-xs font-bold">Email <span className="font-normal text-gray-500">(optional)</span></label>
                <input
                  id="customer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="delivery-location" className="mb-1.5 block text-xs font-bold">Delivery town / area</label>
                <input
                  id="delivery-location"
                  name="deliveryLocation"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={deliveryLocation}
                  onChange={(event) => setDeliveryLocation(event.target.value)}
                  placeholder="Example: Lusaka, Chilenje"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </section>

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-orange-500 px-8 py-4 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Submitting request..." : "Submit Request for Quotation"}</button>
        </form>
        <aside><div className="sticky top-40 rounded-lg bg-blue-950 p-5 text-white shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-orange-400">Afrilink sourcing service</p><h2 className="mt-3 text-xl font-black">One request. One accountable partner.</h2><ul className="mt-5 space-y-4 text-xs leading-relaxed text-blue-100"><li className="flex gap-2"><span className="text-orange-400">✓</span><span>We compare supplier offers privately</span></li><li className="flex gap-2"><span className="text-orange-400">✓</span><span>You receive one official Afrilink quotation</span></li><li className="flex gap-2"><span className="text-orange-400">✓</span><span>Supplier identity and factory pricing stay confidential</span></li><li className="flex gap-2"><span className="text-orange-400">✓</span><span>We coordinate procurement, shipping, customs and delivery</span></li></ul><div className="mt-6 border-t border-blue-800 pt-4 text-[11px] text-blue-200"><p className="font-bold text-white">What happens next?</p><p className="mt-2">Afrilink reviews your requirement and contacts you if specifications need clarification.</p></div></div></aside>
        </div>
      </div>
    </main>
  );
}
