import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-blue-950 text-white border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-yellow-400">
          Afrilink Capital
        </Link>

        <nav className="flex gap-8 text-sm font-semibold">
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

          <Link href="/login" className="hover:text-yellow-400">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}