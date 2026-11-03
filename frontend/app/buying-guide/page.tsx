import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Buying Works",
  description: "Understand the Afrilink sourcing process and what to confirm about pricing, payment, delivery and warranty before ordering equipment.",
};

const steps = [
  ["Tell us what you need", "Share the product, capacity, quantity, power requirements and delivery destination. Photos or model references help clarify your request."],
  ["Review your quotation", "Afrilink sources supplier offers and prepares an official quotation. Check the specifications, price, inclusions and validity before accepting."],
  ["Confirm and order", "Confirm the written payment schedule and order terms with Afrilink before making payment. Keep a copy of your accepted quotation and receipt."],
  ["Coordinate delivery", "Afrilink coordinates procurement and delivery communication. Confirm the shipping arrangement, estimated lead time and collection or delivery point for your order."],
];

export default function BuyingGuidePage() {
  return (
    <main className="bg-slate-50 px-4 py-10 text-slate-800 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-orange-700">Home</Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-orange-700">Buying with Afrilink</p>
        <h1 className="mt-3 text-3xl font-black text-blue-950 sm:text-5xl">From your request to your equipment.</h1>
        <p className="mt-5 max-w-3xl leading-7 text-slate-600">Afrilink Capital is a Lusaka-based sourcing and procurement partner for African businesses. Send your requirements to one team for supplier sourcing, quotations and import coordination.</p>
        <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Ordering process">
          {steps.map(([title, detail], index) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm font-black text-orange-700">STEP {index + 1}</p><h2 className="mt-3 text-xl font-bold text-blue-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p></article>)}
        </section>
        <section id="payment" className="mt-10 scroll-mt-44 rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-blue-950">Pricing and payment</h2>
          <p className="mt-4 leading-7">Before paying, ask for a written breakdown showing the currency, equipment price and whether freight, insurance, customs duties, taxes, installation and local delivery are included or excluded. Confirm any deposit, balance payment and quotation expiry date.</p>
          <p className="mt-3 leading-7">Confirm payment instructions directly with Afrilink using the contact details on this website. Supplier offers and factory pricing are handled privately; your purchasing decision should be based on the complete Afrilink quotation.</p>
        </section>
        <section id="delivery" className="mt-6 scroll-mt-44 rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-blue-950">Availability and delivery</h2>
          <p className="mt-4 leading-7">Ask whether your item is in local stock or imported to order. Confirm when the estimated lead time starts, who handles customs clearance, and the agreed destination. Manufacturing, freight and customs can affect arrival dates; request an estimate specific to your order.</p>
        </section>
        <section id="records" className="mt-6 scroll-mt-44 rounded-2xl bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-blue-950">Warranty, order records and support</h2>
          <p className="mt-4 leading-7">Before ordering, confirm the warranty period, covered parts, installation support, spare-parts arrangements and responsibility for repair or return transport. Ask for cancellation, refund and damaged-goods terms in writing.</p>
          <p className="mt-3 leading-7">Keep your quotation, specifications, payment receipts and delivery records. For an order query or problem, contact Afrilink with your quotation or order reference, a description and any relevant photos.</p>
          <p className="mt-4 border-t pt-4 text-sm leading-6 text-slate-600">This guide explains the buying process. Product-specific prices, availability, warranty and payment or delivery arrangements must be confirmed in your written offer.</p>
        </section>
        <section className="mt-10 rounded-2xl bg-blue-950 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-bold">Ready to source your equipment?</h2>
          <p className="mt-3 leading-7 text-blue-100">Send your requirements or speak to Afrilink about an existing quotation.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/post-request" className="rounded-xl bg-orange-600 px-5 py-3 font-bold hover:bg-orange-700">Request a quotation</Link><a href="https://wa.me/260777777079" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white px-5 py-3 font-bold">WhatsApp +260 777 777 079</a><Link href="/contact" className="px-3 py-3 underline">Contact details</Link></div>
        </section>
      </div>
    </main>
  );
}
