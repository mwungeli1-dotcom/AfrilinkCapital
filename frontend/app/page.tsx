"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    }

    async function fetchProducts() {
      try {
        const res = await fetch("http://afrilinkcapital.onrender.com/products");
        const data = await res.json();

        setProducts((data.products || []).slice(0, 4));
      } catch (error) {
        console.error(error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-blue-950 text-white">
      <nav className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4 p-6 border-b border-blue-800 bg-blue-950">
        <h1 className="text-2xl font-bold text-yellow-400">Afrilink Hub</h1>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-3xl">
            ☰
          </button>
        </div>

        <div
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-6 items-center`}
        >
          <Link href="/products" className="hover:text-yellow-400">
            Products
          </Link>

          <Link href="/post-request" className="hover:text-yellow-400">
            Request Quotation
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-yellow-400">
                Admin Dashboard
              </Link>

              <Link href="/requests" className="hover:text-yellow-400">
                Manage Requests
              </Link>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                className="hover:text-yellow-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-yellow-400">
                Login
              </Link>

              <Link href="/register" className="hover:text-yellow-400">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

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

        {products.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-blue-900">
              No Products Added Yet
            </h3>
            <p className="text-gray-600 mt-2">
              Add products from the admin product page to display them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow p-5">
                <div className="h-32 bg-gray-200 rounded mb-4 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">Product Image</span>
                  )}
                </div>

                <p className="text-sm text-blue-700 font-semibold">
                  {product.category}
                </p>

                <h3 className="text-lg font-bold mt-2 mb-2">
                  {product.name}
                </h3>

                <p className="text-gray-700">{product.price}</p>

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
                  className="block text-center mt-4 w-full bg-blue-900 text-white py-2 rounded"
                >
                  View Product
                </Link>
              </div>
            ))}
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

      <footer className="bg-blue-950 text-white px-6 py-10 border-t border-blue-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h4 className="text-2xl font-bold text-yellow-400">
              Afrilink Hub
            </h4>
            <p className="mt-3 text-gray-300">
              Your import partner for Africa.
            </p>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Quick Links</h5>
            <p>Products</p>
            <p>Request Quotation</p>
            <p>Contact</p>
          </div>

          <div>
            <h5 className="font-semibold mb-3">Contact</h5>
            <p>Lusaka, Zambia</p>
            <p>WhatsApp: +260 777 777 079</p>
          </div>
        </div>
      </footer>
    </main>
  );
}