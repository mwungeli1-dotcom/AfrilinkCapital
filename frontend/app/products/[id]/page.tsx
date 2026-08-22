import Link from "next/link";
import BuyerOnly from "@/components/BuyerOnly";
import SaveProductButton from "@/components/SaveProductButton";
import ProductGallery from "@/components/ProductGallery";

type Product = { _id: string; name: string; category: string; price: string; delivery: string; origin: string; description?: string; image?: string; images?: string[]; video?: string; views?: number; requestCount?: number };

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`https://afrilinkcapital.onrender.com/products/${id}`, { cache: "no-store" });
  const data = await res.json();
  const product: Product | null = data.product || null;

  if (!product) return <main className="min-h-screen bg-slate-100 px-5 py-12"><div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow-sm"><h1 className="text-2xl font-black text-blue-950">Product not found</h1><Link href="/products" className="mt-5 inline-block font-bold text-blue-700 hover:underline">Return to products</Link></div></main>;

  const requestHref = `/post-request?productId=${encodeURIComponent(product._id)}&product=${encodeURIComponent(product.name)}`;
  const whatsappMessage = encodeURIComponent(`Hello Afrilink Capital, I am interested in ${product.name} (${product.price || "price request"}).`);
  const productImages = product.images?.length ? product.images : product.image ? [product.image] : [];

  return (
    <main className="min-h-screen bg-[#f4f4f4] px-3 py-5 lg:px-5">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-slate-500"><Link href="/" className="hover:text-orange-600">Home</Link><span>›</span><Link href="/products" className="hover:text-orange-600">Products</Link><span>›</span><Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-600">{product.category}</Link><span>›</span><span className="max-w-72 truncate text-slate-800">{product.name}</span></div>
        <section className="grid gap-6 rounded-lg bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.9fr)_310px] lg:p-5">
          <div><ProductGallery images={productImages} name={product.name} video={product.video} />{product.video && <div id="product-video" className="mt-4"><video src={product.video} controls className="w-full rounded-lg bg-black" /></div>}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2"><span className="rounded bg-green-50 px-2 py-1 text-[10px] font-black text-green-700">✓ AFRILINK REVIEWED</span><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">Managed sourcing</span></div>
            <p className="mt-4 text-xs font-bold text-orange-600">{product.category}</p><h1 className="mt-2 text-2xl font-black leading-tight text-slate-950 lg:text-3xl">{product.name}</h1>
            <div className="mt-4 border-y bg-orange-50/60 px-4 py-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Listed buyer price</p><p className="mt-1 text-3xl font-black text-slate-950">{product.price || "Request current price"}</p><p className="mt-1 text-[11px] text-slate-500">Freight, customs and final delivery are confirmed in your official quotation.</p></div>
            <dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-3 text-sm"><dt className="text-slate-500">Minimum order</dt><dd className="font-bold">Confirm required quantity</dd><dt className="text-slate-500">Origin</dt><dd className="font-bold">{product.origin || "Global supply"}</dd><dt className="text-slate-500">Lead time</dt><dd className="font-bold">{product.delivery || "Confirm with Afrilink"}</dd><dt className="text-slate-500">Transaction</dt><dd className="font-bold text-blue-700">Managed by Afrilink Capital</dd></dl>
            <div className="mt-5 flex gap-4 border-t pt-4 text-[11px] text-slate-500"><span>{product.views || 0} product views</span><span>{product.requestCount || 0} quotation requests</span></div>
            <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-black text-blue-950">Supplier identity and factory cost stay private</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Afrilink manages negotiation, payment records, shipping, customs coordination and delivery communication.</p></div>
          </div>
          <aside><div className="sticky top-40 rounded-lg border p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">Start your order enquiry</p><p className="mt-2 text-lg font-black">Request an official quotation</p><p className="mt-2 text-xs leading-relaxed text-slate-500">Tell us your quantity and destination. Afrilink will confirm the full landed cost.</p><div className="mt-4 space-y-3"><BuyerOnly><Link href={requestHref} className="block rounded-full bg-orange-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-orange-600">Request quotation</Link></BuyerOnly><SaveProductButton productId={product._id} /><a href={`https://wa.me/260777777079?text=${whatsappMessage}`} target="_blank" rel="noopener noreferrer" className="block rounded-full border border-green-600 px-5 py-3 text-center text-sm font-black text-green-700 hover:bg-green-50">Chat on WhatsApp</a></div><div className="mt-5 border-t pt-4 text-[11px] text-slate-500"><p className="font-bold text-slate-700">Afrilink protection</p><p className="mt-2">✓ One accountable procurement partner</p><p className="mt-2">✓ Documented quotation and order</p><p className="mt-2">✓ Import and delivery coordination</p></div></div></aside>
        </section>
        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]"><div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="text-xl font-black">Product details</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{product.description || "Contact Afrilink for complete specifications and sourcing options."}</p></div><aside className="rounded-lg bg-blue-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-wider text-orange-400">How sourcing works</p><ol className="mt-4 space-y-3 text-sm text-blue-100"><li><strong className="text-white">1.</strong> Submit quantity and destination</li><li><strong className="text-white">2.</strong> Receive one Afrilink quotation</li><li><strong className="text-white">3.</strong> Approve and track procurement</li></ol></aside></section>
      </div>
    </main>
  );
}
