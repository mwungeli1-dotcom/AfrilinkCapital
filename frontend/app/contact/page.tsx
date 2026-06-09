"use client";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-100">

      <section className="bg-blue-950 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-yellow-400">
            Contact Afrilink Capital
          </h1>

          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
            Need a quotation, supplier sourcing assistance, import support,
            machinery procurement or partnership opportunities?
            Our team is ready to assist you.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-950 mb-6">
              Contact Information
            </h2>

            <div className="space-y-4 text-gray-700">

              <div>
                <h3 className="font-bold text-blue-900">Company</h3>
                <p>Afrilink Capital</p>
              </div>

              <div>
                <h3 className="font-bold text-blue-900">Location</h3>
                <p>Lusaka, Zambia</p>
              </div>

              <div>
                <h3 className="font-bold text-blue-900">WhatsApp</h3>
                <p>+260 777 777 079</p>
              </div>

              <div>
                <h3 className="font-bold text-blue-900">Email</h3>
                <p>info@afrilinkcapital.com</p>
              </div>

              <div>
                <h3 className="font-bold text-blue-900">Services</h3>
                <ul className="list-disc ml-6">
                  <li>Product Sourcing</li>
                  <li>Import Procurement</li>
                  <li>Supplier Verification</li>
                  <li>Machinery Acquisition</li>
                  <li>Quotation Management</li>
                  <li>Business Partnerships</li>
                </ul>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-blue-950 mb-6">
              Why Contact Afrilink Capital?
            </h2>

            <div className="space-y-5 text-gray-700">

              <p>
                We help African businesses find reliable suppliers,
                negotiate better prices and manage import logistics.
              </p>

              <p>
                Whether you are looking for industrial machinery,
                manufacturing equipment, water treatment systems,
                construction materials or consumer products,
                Afrilink Capital can assist.
              </p>

              <p>
                We act as your trusted procurement and import partner,
                reducing supplier risks and simplifying international trade.
              </p>

            </div>

            <div className="mt-8">
              <a
                href="https://wa.me/260777777079"
                target="_blank"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}