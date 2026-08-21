"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: string;
  delivery: string;
  origin: string;
  description?: string;
  image?: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiFetch("/products");
        setProducts((data.products || []).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProductsError(true);
      } finally {
        setProductsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-blue-950 text-white">
      <section className="text-center px-6 py-28">
        <h2 className="text-4xl md:text-6xl font-extrabold max-w-4xl mx-auto leading-tight tracking-tight">
          Source, Import & Deliver Products Through Afrilink Capital
        </h2>

        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Browse selected products, request a quotation, and let Afrilink
          Capital handle supplier sourcing, price negotiation, shipping, customs
          clearance, and delivery.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
          <Link
            href="/products"
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded font-semibold"
          >
            Browse Products
          </Link>

          <Link
            href="/post-request"
            className="bg-white text-blue-950 px-8 py-4 rounded-xl hover:bg-yellow-400 transition duration-300"
          >
            Request a Quotation
          </Link>

          <Link
            href="/contact"
            className="border border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-blue-950 transition duration-300"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <section className="px-6 py-12 bg-gray-100 text-black">
        <h2 className="text-2xl font-bold text-center mb-4">
          Featured Import Products
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          Browse selected products from global suppliers. Afrilink Capital
          handles sourcing, negotiation, shipping, customs clearance, and
          delivery.
        </p>

        {productsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Loading featured products">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-xl bg-white shadow" />
            ))}
          </div>
        ) : productsError ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-900">
              Products are temporarily unavailable
            </h3>
            <p className="text-gray-600 mt-2">
              Please browse the showroom again shortly or request a quotation directly.
            </p>
            <Link href="/post-request" className="inline-block mt-5 bg-blue-950 text-white px-6 py-3 rounded-xl">
              Request a Quotation
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-900">
              Tell us what your business needs
            </h3>
            <p className="text-gray-600 mt-2">
              Our catalogue is being updated. Afrilink Capital can still source
              machinery, equipment and commercial products for you.
            </p>
            <Link href="/post-request" className="inline-block mt-5 bg-blue-950 text-white px-6 py-3 rounded-xl">
              Request a Quotation
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const imageUrl = product.image?.trim();

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow p-4 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="h-40 mb-4 flex items-center justify-center overflow-hidden bg-gray-50 rounded-lg border">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No Image</span>
                    )}
                  </div>

                  <p className="text-sm text-blue-700 font-semibold">
                    {product.category}
                  </p>

                  <h3 className="text-lg font-bold mt-2 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-700 font-semibold">
                    {product.price}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Delivery: {product.delivery}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Origin: {product.origin}
                  </p>

                  <p className="text-xs text-gray-500 mt-3">
                    Afrilink Capital manages sourcing, negotiation, importation
                    and delivery.
                  </p>

                  <Link
                    href={`/products/${product._id}`}
                    className="block text-center mt-4 w-full bg-blue-900 text-white py-2 rounded hover:bg-yellow-400 hover:text-black transition"
                  >
                    View Product
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-6 py-16 text-center">
        <h3 className="text-3xl font-bold text-yellow-400">
          Why Afrilink Hub?
        </h3>

        <p className="mt-6 max-w-3xl mx-auto text-gray-300 text-lg">
          We help African entrepreneurs reduce supplier risk, discover better
          products, and access reliable import support through Afrilink Capital.
        </p>
      </section>

      <section className="px-6 py-20 bg-white text-black">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-8">
            About Afrilink Hub
          </h3>

          <p className="text-lg text-gray-700 leading-relaxed">
            Afrilink Hub is a product showroom and quotation request platform
            developed by Afrilink Capital to help African businesses source,
            import and receive products from global suppliers without directly
            dealing with unknown manufacturers.
          </p>
        </div>
      </section>

      <section className="px-6 py-20 bg-gray-100 text-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            Platform Features
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="text-xl font-bold text-blue-950">
                Product Showroom
              </h4>
              <p className="mt-3 text-gray-600">
                Customers browse selected products without supplier contacts
                being exposed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="text-xl font-bold text-blue-950">
                Request Quotations
              </h4>
              <p className="mt-3 text-gray-600">
                Customers request prices through Afrilink Capital, not directly
                from suppliers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="text-xl font-bold text-blue-950">
                Import Management
              </h4>
              <p className="mt-3 text-gray-600">
                Afrilink Capital handles sourcing, negotiation, shipping,
                clearance and delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-white text-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
            What Afrilink Hub Will Help Businesses Do
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border shadow-sm">
              <p className="text-gray-700">
                “Request machinery, equipment and products through one trusted
                African procurement partner.”
              </p>
            </div>

            <div className="p-6 rounded-2xl border shadow-sm">
              <p className="text-gray-700">
                “Reduce the risk of dealing directly with unknown overseas
                suppliers.”
              </p>
            </div>

            <div className="p-6 rounded-2xl border shadow-sm">
              <p className="text-gray-700">
                “Let Afrilink Capital manage sourcing, importation and delivery
                from start to finish.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-semibold uppercase tracking-[0.2em] text-yellow-400">
              A clear procurement process
            </p>
            <h3 className="mt-3 text-3xl font-extrabold md:text-4xl">
              From your request to final delivery
            </h3>
            <p className="mt-4 text-lg text-blue-100">
              Afrilink Capital remains your single point of contact while we
              coordinate sourcing, quotation, importation and delivery.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Tell us what you need", "Submit the product, quantity, destination and any specifications you already have."],
              ["02", "Receive an Afrilink quotation", "We review sourcing options and issue one clear quotation through Afrilink Capital."],
              ["03", "Track sourcing and delivery", "We coordinate the approved order and keep you informed through the delivery process."],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-2xl border border-blue-800 bg-blue-900/40 p-7">
                <span className="text-3xl font-black text-yellow-400">{number}</span>
                <h4 className="mt-5 text-xl font-bold">{title}</h4>
                <p className="mt-3 leading-relaxed text-blue-100">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-black">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-blue-700">
              Why businesses choose Afrilink
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-blue-950 md:text-4xl">
              One trusted partner between your business and global suppliers
            </h3>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              You do not need to spend weeks searching unknown manufacturers or
              coordinating separate shipping and clearance providers.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "Supplier options reviewed before quotation",
              "Supplier contacts and negotiations managed by Afrilink",
              "Clear delivery expectations before order approval",
              "Direct support through WhatsApp and the customer platform",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-gray-200 p-4 shadow-sm">
                <span aria-hidden="true" className="font-bold text-green-600">✓</span>
                <p className="font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-yellow-400 px-6 py-16 text-center text-blue-950">
        <h3 className="text-3xl font-extrabold md:text-4xl">
          Ready to source your next product?
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-lg">
          Send your requirements and let Afrilink Capital prepare the sourcing
          and delivery plan.
        </p>
        <Link
          href="/post-request"
          className="mt-8 inline-block rounded-xl bg-blue-950 px-8 py-4 font-bold text-white transition hover:bg-blue-900"
        >
          Request a Quotation
        </Link>
      </section>

    </main>
  );
}
