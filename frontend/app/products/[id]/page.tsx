type Product = {
  _id: string;
  name: string;
  category: string;
  price: string;
  delivery: string;
  origin: string;
  description?: string;
  image?: string;
  video?: string;
};

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(
    `https://afrilinkcapital.onrender.com/products/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();
  const product: Product | null = data.product || null;

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
          <h1 className="text-2xl font-bold text-red-600">
            Product not found
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        <div className="h-80 bg-gray-200 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
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

        {product.video && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-900 mb-3">
              Product Video
            </h2>

            <video
              src={product.video}
              controls
              className="w-full rounded-xl"
            />
          </div>
        )}

        <p className="text-sm text-blue-700 font-semibold">
          {product.category}
        </p>

        <h1 className="text-4xl font-bold text-blue-950 mt-2 mb-4">
          {product.name}
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          {product.description || "No description provided"}
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Estimated Price</strong>
            <p>{product.price}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Origin</strong>
            <p>{product.origin}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <strong>Delivery Time</strong>
            <p>{product.delivery}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-5 rounded-xl mb-6">
          <p className="text-sm text-gray-700">
            Supplier details are protected. Afrilink Capital manages sourcing,
            negotiation, supplier communication, shipping, customs clearance,
            and delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`/post-request?product=${encodeURIComponent(product.name)}`}
            className="bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-yellow-400 hover:text-black transition"
          >
            Request Through Afrilink
          </a>

          <a
            href={`https://wa.me/260777777079?text=${encodeURIComponent(
              `Hello Afrilink Capital, I am interested in ${product.name}`
            )}`}
            target="_blank"
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-green-700 transition"
          >
            WhatsApp Afrilink
          </a>
        </div>
      </div>
    </main>
  );
}