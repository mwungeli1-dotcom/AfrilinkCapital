"use client";
import { apiFetch } from "../../src/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  }
};
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-blue-950 mb-2">
          Request Through Afrilink
        </h1>

        <p className="text-gray-600 mb-8">
          Tell Afrilink Capital what you need. We will manage sourcing,
          negotiation, shipping, customs clearance, and delivery.
        </p>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-blue-50 p-5">
            <h2 className="text-xl font-bold text-blue-950">Your contact details</h2>
            <p className="mt-1 text-sm text-gray-600">
              Afrilink will use these details to confirm specifications and send your quotation.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="customer-name" className="block mb-2 font-semibold">Full Name</label>
                <input
                  id="customer-name"
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white p-4"
                />
              </div>

              <div>
                <label htmlFor="customer-phone" className="block mb-2 font-semibold">Phone / WhatsApp</label>
                <input
                  id="customer-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Example: +260 777 777 079"
                  className="w-full rounded-xl border border-gray-300 bg-white p-4"
                />
              </div>

              <div>
                <label htmlFor="customer-email" className="block mb-2 font-semibold">Email <span className="font-normal text-gray-500">(optional)</span></label>
                <input
                  id="customer-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-gray-300 bg-white p-4"
                />
              </div>

              <div>
                <label htmlFor="delivery-location" className="block mb-2 font-semibold">Delivery Town / Area</label>
                <input
                  id="delivery-location"
                  name="deliveryLocation"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={deliveryLocation}
                  onChange={(event) => setDeliveryLocation(event.target.value)}
                  placeholder="Example: Lusaka, Chilenje"
                  className="w-full rounded-xl border border-gray-300 bg-white p-4"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="request-title" className="block mb-2 font-semibold">Product Title</label>

            <input
              type="text"
              id="request-title"
              name="title"
              required
              placeholder="Example: 500LPH RO Water Machine"
              className="w-full border border-gray-300 rounded-xl p-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="request-description" className="block mb-2 font-semibold">
              Product Description
            </label>

            <textarea
              id="request-description"
              name="description"
              required
              placeholder="Describe the product or machine you need..."
              className="w-full border border-gray-300 rounded-xl p-4 h-40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="request-quantity" className="block mb-2 font-semibold">Quantity</label>

              <input
                type="text"
                id="request-quantity"
                name="quantity"
                required
                placeholder="Example: 2 Machines"
                className="w-full border border-gray-300 rounded-xl p-4"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="request-country" className="block mb-2 font-semibold">Delivery Country</label>

              <input
                type="text"
                id="request-country"
                name="country"
                autoComplete="country-name"
                required
                placeholder="Example: Zambia"
                className="w-full border border-gray-300 rounded-xl p-4"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-950 text-white px-8 py-4 rounded-xl hover:bg-yellow-400 hover:text-black transition duration-300"
          >
            Submit Request
          </button>
        </form>
      </div>
    </main>
  );
}
