import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white px-6 py-10 border-t border-blue-800">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        <div>
          <h4 className="text-2xl font-bold text-yellow-400">
            Afrilink Hub
          </h4>

          <p className="mt-3 text-gray-300">
            Your trusted import partner for Africa.
          </p>

          <p className="mt-3">
            Facebook:
            <a
              href="https://www.facebook.com/afrilinkcapital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 ml-2 hover:text-white"
            >
              Afrilink Capital
            </a>
          </p>
        </div>

        <div>
          <h5 className="font-semibold mb-3 text-yellow-400">Quick Links</h5>

          <div className="flex flex-col gap-2">
            <Link href="/" className="hover:text-yellow-400">
              Home
            </Link>

            <Link href="/products" className="hover:text-yellow-400">
              Products
            </Link>

            <Link href="/post-request" className="hover:text-yellow-400">
              Request Quotation
            </Link>

            <Link href="/contact" className="hover:text-yellow-400">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h5 className="font-semibold mb-3 text-yellow-400">Contact</h5>
          <p>Lusaka, Zambia</p>
          <p>WhatsApp: +260 777 777 079</p>
          <p className="mt-3 text-gray-400 text-sm">
            Source • Import • Deliver
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-blue-800 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Afrilink Capital. All rights reserved.
      </div>
    </footer>
  );
}