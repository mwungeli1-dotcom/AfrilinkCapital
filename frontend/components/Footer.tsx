import Link from "next/link";
import BuyerOnly from "./BuyerOnly";

const columns = [["About Afrilink", ["Why choose Afrilink", "African market focus", "Supplier confidentiality", "Contact our team"]], ["Buyer protection", ["Managed payments", "Official quotations", "Order records", "Import coordination"]], ["Source on Afrilink", ["Verified products", "Request for quotation", "Saved products", "Product categories"]], ["Help Center", ["Buyer help", "Supplier help", "Shipping support", "Report a problem"]], ["Sell on Afrilink", ["Supplier registration", "List a product", "Supplier dashboard", "Application status"]]] as const;

function linkFor(label: string) {
  if (["Verified products", "Product categories"].includes(label)) return "/products";
  if (label === "Request for quotation") return "/post-request";
  if (label === "Saved products") return "/saved-products";
  if (["Supplier registration", "Application status"].includes(label)) return "/register?type=supplier";
  if (label === "List a product") return "/admin/products/create";
  if (label === "Supplier dashboard") return "/dashboard";
  return "/contact";
}

export default function Footer() {
  return <footer className="border-t bg-white text-slate-800"><div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 px-5 py-10 text-xs sm:grid-cols-3 lg:grid-cols-5 lg:py-14">{columns.map(([title, links]) => <div key={title}><h3 className="mb-4 text-sm font-black text-slate-950">{title}</h3><div className="flex flex-col gap-3">{links.map((label) => label === "Request for quotation" ? <BuyerOnly key={label}><Link href={linkFor(label)} className="hover:text-orange-600">{label}</Link></BuyerOnly> : <Link key={label} href={linkFor(label)} className="hover:text-orange-600">{label}</Link>)}</div></div>)}</div><div className="border-t"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 text-xs text-slate-500 md:flex-row md:items-center md:justify-between"><div><Link href="/" className="text-xl font-black text-orange-600">Afrilink<span className="text-blue-950">Capital</span></Link><p className="mt-2">Source • Verify • Import • Deliver across Africa</p></div><div className="flex flex-wrap gap-4"><a href="https://www.facebook.com/afrilinkcapital" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://wa.me/260777777079" target="_blank" rel="noopener noreferrer">WhatsApp +260 777 777 079</a><span>Lusaka, Zambia</span></div></div></div><div className="bg-slate-100 px-5 py-5 text-center text-[11px] text-slate-500">© {new Date().getFullYear()} Afrilink Capital. Managed sourcing and procurement for African businesses.</div></footer>;
}
