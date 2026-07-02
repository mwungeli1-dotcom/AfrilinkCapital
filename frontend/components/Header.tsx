import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          Afrilink Capital
        </Link>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-700">
            Home
          </Link>

          <Link href="/products" className="hover:text-blue-700">
            Products
          </Link>

          <Link href="/post-request" className="hover:text-blue-700">
            Request Quote
          </Link>

          <Link href="/contact" className="hover:text-blue-700">
            Contact
          </Link>

          <Link href="/login" className="hover:text-blue-700">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}