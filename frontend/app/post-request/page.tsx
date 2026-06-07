"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type RequestItem = {
  title: string;
  description: string;
  quantity: string;
  country: string;
};

export default function PostRequestPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [country, setCountry] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productName = params.get("product");

    if (productName) {
      setTitle(productName);
      setDescription(
        `I am interested in importing ${productName} through Afrilink Capital.`
      );
    }
  }, []);

  const handleSubmit = async () => {
    if (!title || !description || !quantity || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    const newRequest = {
      title,
      description,
      quantity,
      country,
    };

    try {
      const response = await fetch("http://afrilinkcapital.onrender.com/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      const data = await response.json();
      console.log(data);

      setRequests([...requests, newRequest]);

      toast.success("Request submitted successfully!");

      setTitle("");
      setDescription("");
      setQuantity("");
      setCountry("");

      setTimeout(() => {
        window.location.href = "/requests";
      }, 1000);
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

        <form className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Product Title</label>

            <input
              type="text"
              placeholder="Example: 500LPH RO Water Machine"
              className="w-full border border-gray-300 rounded-xl p-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Product Description
            </label>

            <textarea
              placeholder="Describe the product or machine you need..."
              className="w-full border border-gray-300 rounded-xl p-4 h-40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Quantity</label>

              <input
                type="text"
                placeholder="Example: 2 Machines"
                className="w-full border border-gray-300 rounded-xl p-4"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Country</label>

              <input
                type="text"
                placeholder="Example: Zambia"
                className="w-full border border-gray-300 rounded-xl p-4"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            type="button"
            className="bg-blue-950 text-white px-8 py-4 rounded-xl hover:bg-yellow-400 hover:text-black transition duration-300"
          >
            Submit Request
          </button>
        </form>
      </div>
    </main>
  );
}