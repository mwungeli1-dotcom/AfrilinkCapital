import Image from "next/image";
import Link from "next/link";
import BuyerOnly from "@/components/BuyerOnly";
import SaveProductButton from "@/components/SaveProductButton";

type Product = { _id: string; name: string; category: string; price: string; delivery: string; origin: string; description?: string; image?: string; video?: string; views?: number; requestCount?: number };

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`https://afrilinkcapital.onrender.com/products/${id}`, { cache: "no-store" });
  const data = await res.json();
  const product: Product | null = data.product || null;

  if (!product) return <main className="min-h-screen bg-slate-100 px-5 py-12"><div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow-sm"><h1 className="text-2xl font-black text-blue-950">Product not found</h1><Link href="/products" className="mt-5 inline-block font-bold text-blue-700 hover:underline">Return to products</Link></div></main>;

  const requestHref = `/post-request?productId=${encodeURIComponent(product._id)}&product=${encodeURIComponent(product.name)}`;
  const whatsappMessage = encodeURIComponent(`Hello Afrilink Capital, I am interested in ${product.name} (${product.price || "price request"}).`);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center gap-2 overflow-x-auto text-sm text-slate-500"><Link href="/" className="hover:text-blue-800">Home</Link><span>/</span><Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-blue-800">{product.category}</Link><span>/</span><span className="max-w-72 truncate text-slate-800">{product.name}</span></div>
        <section className="grid gap-7 rounded-3xl bg-white p-4 shadow-sm md:p-7 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">{product.image ? <Image unoptimized fill preload sizes="(max-width: 1024px) 100vw, 50vw" src={product.image} alt={product.name} className="object-contain" /> : <div className="flex h-full items-center justify-center text-7xl text-slate-300">▦</div>}</div>
            {product.video && <div className="mt-4"><video src={product.video} controls className="w-full rounded-2xl bg-black" /></div>}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">✓ AFRILINK REVIEWED</span><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">Managed sourcing</span></div>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.15em] text-yellow-600">{product.category}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-blue-950 md:text-4xl">{product.name}</h1>
            <div className="mt-5 rounded-2xl bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Buyer price</p><p className="mt-1 text-3xl font-black text-blue-950 md:text-4xl">{product.price || "Request current price"}</p><p className="mt-2 text-xs text-slate-500">Final delivery quotation depends on quantity, destination, freight and customs requirements.</p></div>
            <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border p-4"><p className="text-xs font-bold text-slate-500">ORIGIN</p><p className="mt-1 font-black text-slate-900">{product.origin || "Global supply"}</p></div><div className="rounded-xl border p-4"><p className="text-xs font-bold text-slate-500">EST. DELIVERY</p><p className="mt-1 font-black text-slate-900">{product.delivery || "Confirm with Afrilink"}</p></div></div>
            <div className="mt-5 flex gap-4 border-y py-4 text-xs text-slate-500"><span>{product.views || 0} product views</span><span>{product.requestCount || 0} quotation requests</span></div>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="font-black text-blue-950">Protected transaction</p><p className="mt-1 text-sm leading-relaxed text-slate-700">Afrilink keeps supplier identities and factory costs confidential while managing negotiation, payment records, shipping, customs clearance and delivery.</p></div>
            <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2"><BuyerOnly><Link href={requestHref} className="block rounded-xl bg-yellow-400 px-5 py-4 text-center font-black text-blue-950 hover:bg-yellow-300">Request official quotation</Link></BuyerOnly><SaveProductButton productId={product._id} /><a href={`https://wa.me/260777777079?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-green-600 px-5 py-4 text-center font-black text-white hover:bg-green-700 sm:col-span-2">Ask on WhatsApp</a></div>
          </div>
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><div className="rounded-3xl bg-white p-6 shadow-sm md:p-8"><h2 className="text-2xl font-black text-blue-950">Product details</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-700">{product.description || "Contact Afrilink for complete specifications and sourcing options."}</p></div><aside className="rounded-3xl bg-blue-950 p-6 text-white shadow-sm"><p className="text-sm font-bold uppercase tracking-wider text-yellow-400">Afrilink sourcing promise</p><ul className="mt-5 space-y-4 text-sm text-blue-100">{["Supplier offer reviewed privately", "One official Afrilink quotation", "Clear payment and order tracking", "Import and delivery coordination"].map((item) => <li key={item} className="flex gap-3"><span className="font-black text-yellow-400">✓</span><span>{item}</span></li>)}</ul></aside></section>
      </div>
    </main>
  );
}
